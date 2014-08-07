var flatten = require('lodash.flatten');
var uniq = require('lodash.uniq');
var geo = require('../vocab/wgs84');
var NodeFactory = require('../rdf/node-factory');
var tryMergeNode = require('./try-merge-node');

/**
 * Adds a quad tree cache to the lookup service
 */
var DataServiceBboxCache = function(listServiceBbox, maxGlobalItemCount, maxItemsPerTileCount, aquireDepth) {
    this.initialize(listServiceBbox, maxGlobalItemCount, maxItemsPerTileCount, aquireDepth);
};


DataServiceBboxCache.prototype.initialize = function(listServiceBbox, maxGlobalItemCount, maxItemsPerTileCount, aquireDepth) {
    this.listServiceBbox = listServiceBbox;

    var maxBounds = new geo.Bounds(-180.0, -90.0, 180.0, 90.0);
    this.quadTree = new geo.QuadTree(maxBounds, 18, 0);

    this.maxItemsPerTileCount = maxItemsPerTileCount || 25;
    this.maxGlobalItemCount = maxGlobalItemCount || 50;
    this.aquireDepth = aquireDepth || 2;
};

// TODO: limit and offset currently ignored
DataServiceBboxCache.prototype.fetchData = function(bounds) {
    var result = this.runWorkflow(bounds).pipe(function(nodes) {
        var arrayOfDocs = nodes.map(function(node) {
            return node.data.docs;
        });

        // Remove null items
        var docs = arrayOfDocs.filter(function(item) { return item; });
        docs = flatten(docs, true);


        // Add clusters as regular items to the list??? 
        nodes.forEach(function(node) {
            if (node.isLoaded) {
                return;
            }

            var wkt = geo.GeoExprUtils.boundsToWkt(node.getBounds());

            var cluster = {
                id: wkt,
                //type: 'cluster',
                //isZoomCluster: true,
                zoomClusterBounds: node.getBounds(),
                wkt: NodeFactory.createPlainLiteral(wkt)
            };

            docs.push(cluster);
        });


        return docs;
    });

    return result;
};
/*
DataServiceBboxCache.prototype.fetchCount = function(bounds, threshold) {
        var result = this.listServiceBbox.fetchCount(bounds, threshold);
        return result;
};
*/
DataServiceBboxCache.prototype.runCheckGlobal = function() {
    var result;

    var rootNode = this.quadTree.getRootNode();

    if (!rootNode.checkedGlobal) {
        var countTask = this.listServiceBbox.fetchCount(null, this.maxGlobalItemCount);

        // var countFlow =
        // this.createFlowForGlobal().find().concept(this.concept).limit(self.maxGlobalItemCount);
        // var countTask = countFlow.count();
        var globalCheckTask = countTask.pipe(function(countInfo) {
            var canUseGlobal = !countInfo.hasMoreItems;
            console.log('Global check counts', countInfo);
            rootNode.canUseGlobal = canUseGlobal;
            rootNode.checkedGlobal = true;

            return canUseGlobal;
        });

        result = globalCheckTask;
    } else {
        var deferred = $.Deferred();
        deferred.resolve(rootNode.canUseGlobal);
        result = deferred.promise();
    }

    return result;
};

DataServiceBboxCache.prototype.runWorkflow = function(bounds) {
    var deferred = $.Deferred();

    var rootNode = this.quadTree.getRootNode();

    var self = this;
    this.runCheckGlobal().pipe(function(canUseGlobal) {
        console.log('Can use global? ', canUseGlobal);
        var task;
        if (canUseGlobal) {
            task = self.runGlobalWorkflow(rootNode);
        } else {
            task = self.runTiledWorkflow(bounds);
        }

        task.done(function(nodes) {
            deferred.resolve(nodes);
        }).fail(function() {
            deferred.fail();
        });
    }).fail(function() {
        deferred.fail();
    });

    var result = deferred.promise();

    return result;
};

DataServiceBboxCache.prototype.runGlobalWorkflow = function(node) {
    var self = this;

    var result = this.listServiceBbox.fetchItems(null).pipe(function(docs) {
        // console.log("Global fetching: ", geomToFeatureCount);
        self.loadTaskAction(node, docs);

        return [node];
    });

    return result;
};


/**
 * This method implements the primary workflow for tile-based fetching
 * data.
 *
 * globalGeomCount = number of geoms - facets enabled, bounds disabled.
 * if(globalGeomCount > threshold) {
 *
 *
 * nodes = aquire nodes. foreach(node in nodes) { fetchGeomCount in the
 * node - facets TODO enabled or disabled?
 *
 * nonFullNodes = nodes where geomCount < threshold foreach(node in
 * nonFullNodes) { fetch geomToFeatureCount - facets enabled
 *
 * fetch all positions of geometries in that area -- Optionally:
 * fetchGeomToFeatureCount - facets disabled - this can be cached per
 * type of interest!! } } }
 *
 */
DataServiceBboxCache.prototype.runTiledWorkflow = function(bounds) {
    var self = this;

    //console.log("Aquiring nodes for " + bounds);
    var nodes = this.quadTree.aquireNodes(bounds, this.aquireDepth);

    // console.log('Done aquiring');

    // Init the data attribute if needed
    nodes.forEach(function(node) {
        if (!node.data) {
            node.data = {};
        }
    });


    // Mark empty nodes as loaded
    nodes.forEach(function(node) {
        if (node.isCountComplete() && node.infMinItemCount === 0) {
            node.isLoaded = true;
        }
    });


    var uncountedNodes = nodes.filter(function(node) {
        return self.isCountingNeeded(node);
    });
    // console.log("# uncounted nodes", uncountedNodes.length);

    // The deferred is only resolved once the whole workflow completed
    var result = $.Deferred();


    var countTasks = this.createCountTasks(uncountedNodes);

    $.when.apply(window, countTasks).done(function() {
        var nonLoadedNodes = nodes.filter(function(node) {
            return self.isLoadingNeeded(node);
        });
        // console.log("# non loaded nodes", nonLoadedNodes.length,
        // nonLoadedNodes);

        var loadTasks = self.createLoadTasks(nonLoadedNodes);
        $.when.apply(window, loadTasks).done(function() {
            // ns.QuadTreeCache.finalizeLoading(nodes);

            result.resolve(nodes);
            /*
                $.when(self.postProcess(nodes)).then(function() {
                    // self.isLocked = false;
                    // console.debug("Workflow completed. Resolving
                    // deferred.");
                    result.resolve(nodes);
                });
                */
        });
    }).fail(function() {
        result.fail();
    });

    return result;
};



DataServiceBboxCache.prototype.createCountTask = function(node) {

    var self = this;
    var threshold = self.maxItemsPerTileCount; // ? self.maxItemsPerTileCount + 1 : null;


    var countPromise = this.listServiceBbox.fetchCount(node.getBounds(), threshold);
    var result = countPromise.pipe(function(itemCountInfo) {
        var itemCount = itemCountInfo.count;
        node.setMinItemCount(itemCountInfo.count);

        // If the value is 0, also mark the node as loaded
        if (itemCount === 0) {
            // self.initNode(node);
            node.isLoaded = true;
        }
    });


    // var countFlow =
    // this.createFlowForBounds(node.getBounds()).find().concept(this.concept).limit(limit);
    // var result = countFlow.count().pipe(function(itemCountInfo) {

    return result;
};

/**
 * If either the minimum number of items in the node is above the
 * threshold or all children have been counted, then there is NO need
 * for counting
 *
 */
DataServiceBboxCache.prototype.isCountingNeeded = function(node) {
    // console.log("Node To Count:", node, node.isCountComplete());
    return !(this.isTooManyGeoms(node) || node.isCountComplete());
};



/**
 * Loading is needed if NONE of the following criteria applies: . node
 * was already loaded . there are no items in the node . there are to
 * many items in the node
 *
 */
DataServiceBboxCache.prototype.isLoadingNeeded = function(node) {

    // (node.data && node.data.isLoaded)
    var noLoadingNeeded = node.isLoaded || (node.isCountComplete() && node.infMinItemCount === 0) || this.isTooManyGeoms(node);

    return !noLoadingNeeded;
};


DataServiceBboxCache.prototype.isTooManyGeoms = function(node) {
    // console.log("FFS", node.infMinItemCount, node.getMinItemCount());
    return node.infMinItemCount >= this.maxItemsPerTileCount;
};



DataServiceBboxCache.prototype.createCountTasks = function(nodes) {
    var self = this;
    var result = nodes.map(function(node) {
            return self.createCountTask(node);
        }).filter(function(item) { return item; });

    return result;
};

/**
 * Sets the node's state to loaded, attaches the geomToFeatureCount to
 * it.
 *
 * @param node
 * @param geomToFeatureCount
 */
DataServiceBboxCache.prototype.loadTaskAction = function(node, docs) {
    // console.log('Data for ' + node.getBounds() + ': ', docs);
    node.data.docs = docs;
    node.isLoaded = true;
};

DataServiceBboxCache.prototype.createLoadTasks = function(nodes) {
    var self = this;
    var result = nodes.map(function(node) {
        var loadTask = self.listServiceBbox.fetchItems(node.getBounds()).pipe(function(docs) {
            self.loadTaskAction(node, docs);
        });

        return loadTask;
    });

    return result;
};


/**
 * TODO Finishing this method at some point to merge nodes together
 * could be useful
 *
 */
DataServiceBboxCache.prototype.finalizeLoading = function(nodes) {
    // Restructure all nodes that have been completely loaded,
    var parents = [];

    nodes.forEach(function(node) {
        if (node.parent) {
            parents.push(node.parent);
        }
    });

    parents = uniq(parents);

    var change = false;
    do {
        change = false;
        for (var i in parents) {
            var p = parents[i];

            var children = p.children;

            var didMerge = tryMergeNode(p);
            if (!didMerge) {
                continue;
            }

            change = true;

            children.forEach(function(child) {
                var indexOf = nodes.indexOf(child);
                if (indexOf >= 0) {
                    nodes[indexOf] = undefined;
                }
            });

            nodes.push(p);

            if (p.parent) {
                parents.push(p.parent);
            }

            break;
        }
    } while (change === true);

    nodes = nodes.filter(function(item) { return item; });

    /*
     * $.each(nodes, function(i, node) { node.isLoaded = true; });
     */

    // console.log("All done");
    // self._setNodes(nodes, bounds);
    // callback.success(nodes, bounds);
};

module.exports = DataServiceBboxCache;