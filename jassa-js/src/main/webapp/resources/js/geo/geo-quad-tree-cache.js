(function() {
    
    var ns = Jassa.geo;

    var defaultDocWktExtractorFn = function(doc) {
        var wktStr = doc.wkt;

        var points = ns.WktUtils.extractPointsFromWkt(wktStr);
        var result = ns.WktUtils.createBBoxFromPoints(points);

        return result;
    };

    var number = '(\\d+(\\.\\d*)?)';
    var nonNumber = '[^\\d]*'
    ns.pointRegexPattern = new RegExp(nonNumber + '(' + number + '\\s+' + number + nonNumber + ')');

    ns.WktUtils = {

        extractPointsFromWkt: function(wktStr) {
            var result = [];
            
            while (match = ns.pointRegexPattern.exec(wktStr)) {
                var strX = match[2];
                var strY = match[4];
                var x = parseFloat(strX);
                var y = parseFloat(strY);
                
                
                var p = new ns.Point(x, y);
                result.push(p);
                
                wktStr = wktStr.replace(match[0], '');                
            }
            
            return result;
        },
        
        createBBoxFromPoints: function(points) {
            var minX = null;
            var minY = null;
            var maxX = null;
            var maxY = null;
            
            _(points).each(function(point) {
                var x = point.getX();
                var y = point.getY();
                
                minX = !minX ? x : Math.min(minX, x);
                minY = !minY ? y : Math.min(minY, y);
                maxX = !maxX ? x : Math.max(maxX, x);
                maxY = !maxY ? y : Math.max(maxY, y);
            });
            
            var result = new ns.Bounds(minX, minY, maxX, maxY);
            return result;
        }
    };
    
    
    /**
     * 
     * fetchData
     *   runWorkflow
     *      runGlobalWorkflow
     *      runTiledWorkflow
     * 
     * 
     * Given a geoQueryFactory (i.e. a factory object, that can create queries for given bounds),
     * this class caches results for bounds.
     * 
     * The process is as follows:
     * The orginial bounds are extended to the size of tiles in a quad tree.
     * Then the data is fetched.
     * A callback with the data and the original bounds is invoked.
     * IMPORTANT! The callback has to make sure how to filter the data against the original bounds (if needed)
     * 
     * TODO This class is not aware of postprocessing by filtering against original bounds - should it be?
     * 
     * @param backend
     * @returns {ns.QuadTreeCache}
     */
    ns.QuadTreeCache = Class.create({ 
        initialize: function(sparqlService, geoMapFactory, fnGetBBox, options) {
            this.sparqlService = sparqlService;
            
            var maxBounds = new qt.Bounds(-180.0, 180.0, -90.0, 90.0);
            this.quadTree = new qt.QuadTree(maxBounds, 18, 0);
        
            this.backendFactory = backendFactory;
    
            if(!options) {
                options = {};
            }
            
            this.maxItemsPerTileCount = options.maxItemsPerTileCount || 25;
            this.maxGlobalItemCount = options.maxGlobalItemCount || 50;
            
            this.geoMapFactory = geoMapFactory;
            

            
            this.fnGetBBox = fnGetBBox || ns.defaultDocWktExtractorFn;
        },

        
        /**
         * Method for fetching data within the given bounds
         * 
         */
        fetchData: function(bounds) {
            // TODO Why do we lock at all???? - The frequency of locks should not be of concern here
            var self = this;
            if(this.isLocked) {
                return;
            }
            this.isLocked = true;
    
            var result = $.Deferred();
            
            var task = this.runWorkflow(bounds);
            
            task.done(function(nodes) {
                result.resolve(nodes);
            }).fail(function() {
                result.fail();
            }).then(function() {
                self.isLocked = false;                
            });
            
            return result;
        },
        
        runWorkflow: function(bounds) {
            var rootNode = this.quadTree.getRootNode();
            
            var self = this;
            var result;
            //console.log("Initiating data fetching workflow");
            if(!rootNode.checkedGlobal) {
                
                //console.log("Checking applicability of global fetching strategy (was not checked before)");
                
                result = $.Deferred();

                
                globalCheckTask = this.backendFactory.forGlobal().fetchGeomCount(self.maxGlobalItemCount).pipe(function(geomCount) {
                    //console.debug("Global check counts", geomCount, self.maxGlobalItemCount);
                    return !(geomCount >= self.maxGlobalItemCount);
                });
    
                result = $.Deferred();
    
                globalCheckTask.done(function(canUseGlobal) {
    
                    //console.log("Applicability: ", canUseGlobal);
                    
                    rootNode.checkedGlobal = true;
                    task = canUseGlobal ? self.runGlobalWorkflow(rootNode) : self.runTiledWorkflow(bounds);
    
                    $.when(task).then(function(nodes) {
                        result.resolve(nodes);
                    }).fail(function() {
                        result.fail();
                    });
                }).fail(function() {
                    result.fail();
                });
            } else {
                console.log("Using tile based strategy (global strategy checked)");
                result = self.runTiledWorkflow(bounds);
            }
            
            return result;
        },
    
        runGlobalWorkflow: function(node) {
        
            var self = this;
            
            var result = $.Deferred();
    
            // Fetch the items
            var flow = sponate.SponateUtils.createQueryFlow(geoMapFactory.createMapForGlobal());

            var promise = sponate.SponateUtils.exec(sparqlService, flow);
            
            var loadTask = promise.pipe(function(docs) {
                //console.log("Global fetching: ", geomToFeatureCount);
                self.loadTaskAction(node, docs);
            });
    
            loadTask.done(function() {
                $.when(self.postProcess([node])).done(function() {
                    //console.log("Global workflow completed.");
                    //console.debug("Workflow completed. Resolving deferred.");
                    result.resolve([node]);
                }).fail(function() {
                    result.fail();
                });
            }).fail(function() {
                result.fail();
            });
    
            return result;
        },
        
        
        /**
         * This method implements the primary workflow for tile-based fetching data.
         * 
         * globalGeomCount = number of geoms - facets enabled, bounds disabled.
         * if(globalGeomCount > threshold) {
         * 
         * 
         *    nodes = aquire nodes.
         *    foreach(node in nodes) {
         *        fetchGeomCount in the node - facets TODO enabled or disabled?
         *        
         *        nonFullNodes = nodes where geomCount < threshold
         *        foreach(node in nonFullNodes) {
         *            fetch geomToFeatureCount - facets enabled
         *            
         *            fetch all positions of geometries in that area
         *            -- Optionally: fetchGeomToFeatureCount - facets disabled - this can be cached per type of interest!!
         *        }
         *    }
         * } 
         * 
         */
        runTiledWorkflow: function(bounds) {
            var self = this;
                
            
            //console.log("Aquiring nodes for " + bounds);
            var nodes = this.quadTree.aquireNodes(bounds, 2);
    
            // Init the data attribute if needed
            _.each(nodes, function(node) {
                if(!node.data) {
                    node.data = {};
                }
            });
            
    
            // Mark empty nodes as loaded
            _.each(nodes, function(node) {
                if(node.isCountComplete() && node.infMinItemCount === 0) {
                    node.isLoaded = true;
                }
            });
    
            
            var uncountedNodes = _.filter(nodes, function(node) { return self.isCountingNeeded(node); });
            //console.log("# uncounted nodes", uncountedNodes.length);
    
            // The deferred is only resolved once the whole workflow completed
            var result = $.Deferred();
    
            
            var countTasks = this.createCountTasks(uncountedNodes);
            
            $.when.apply(window, countTasks).then(function() {
                nonLoadedNodes = _.filter(nodes, function(node) { return self.isLoadingNeeded(node); });
                //console.log("# non loaded nodes", nonLoadedNodes.length, nonLoadedNodes);
                
                var loadTasks = self.createLoadTasks(nonLoadedNodes);
                $.when.apply(window, loadTasks).then(function() {
                    //ns.QuadTreeCache.finalizeLoading(nodes);
                    
                    $.when(self.postProcess(nodes)).then(function() {
                        //self.isLocked = false;
                        //console.debug("Workflow completed. Resolving deferred.");
                        result.resolve(nodes);
                    });
                });
            });
            
            return result;
        },

        
        
        
        createCountTask: function(node) {

            var self = this;

            var flow = null;
            
            var map = geoMapFactory.createMapForBounds(node.getBounds());
            
            
            var limit = self.maxItemsPerTileCount ? self.maxItemsPerTileCount + 1 : null;
            flow.limit(limit)
            var concept = flow.getConcept();
            
            
            
            var result =
                service.ConceptUtils.fetchCount(concept).pipe(function(itemCount) {
    
                    //console.debug("Counted items within " + node.getBounds(), value);
                    
                    node.setMinItemCount(itemCount); 
                    
                    // If the value is 0, also mark the node as loaded
                    if(itemCount === 0) {
                        //self.initNode(node);
                        node.isLoaded = true;
                    }
                });
            
            return result;
        },
    
        /**
         * If either the minimum number of items in the node is above the threshold or
         * all children have been counted, then there is NO need for counting
         * 
         */
        isCountingNeeded: function(node) {
            //console.log("Node To Count:", node, node.isCountComplete());            
            return !(this.isTooManyGeoms(node) || node.isCountComplete());
        },
    
    

        /**
         * Loading is needed if NONE of the following criteria applies:
         * . node was already loaded
         * . there are no items in the node
         * . there are to many items in the node
         * 
         */
        isLoadingNeeded: function(node) {
    
            //(node.data && node.data.isLoaded)
            var noLoadingNeeded = node.isLoaded || (node.isCountComplete() && node.infMinItemCount === 0) || this.isTooManyGeoms(node);
            
            return !noLoadingNeeded;
        },
    
    
        isTooManyGeoms: function(node) {    
            //console.log("FFS", node.infMinItemCount, node.getMinItemCount());
            return node.infMinItemCount >= this.maxItemsPerTileCount;
        },
        
    
    
        createCountTasks: function(nodes) {
            var self = this;
            var result = _(nodes).chain()
                .map(nodes, function(node) {
                    return self.createCountTask(node);
                })
                .compact() // Remove null entries
                .value();
            
            /*
            var result = [];
            $.each(nodes, function(i, node) {
                var task = self.createCountTask(node);
                if(task) {
                    result.push(task);
                }
            });
            */
    
            return result;
        },
    
//    
//        /**
//         * 
//         * @param node
//         * @returns
//         */
//        createTaskGeomToFeatureCount: function(node) {
//            var result = this.backend.fetchGeomToFeatureCount().pipe(function(geomToFeatureCount) {
//                node.data.geomToFeatureCount = geomToFeatureCount;
//            });
//            
//            return result;
//        },
    
    
        /**
         * Sets the node's state to loaded, attaches the geomToFeatureCount to it.
         * 
         * @param node
         * @param geomToFeatureCount
         */
        loadTaskAction: function(node, docs) {
            node.data.docs = docs;
            node.isLoaded = true;            
        },
    
        createLoadTasks: function(nodes) {
            var self = this;
            var result = [];
                        
            //$.each(nodes, function(index, node) {
            _.each(nodes, function(node) {
                //console.debug("Inferred minimum item count: ", node.infMinItemCount);
    
                //if(node.data.absoluteGeomToFeatureCount)
                
                var loadTask = self.backendFactory.forBounds(node.getBounds()).fetchGeomToFeatureCount().pipe(function(geomToFeatureCount) {
                    self.loadTaskAction(node, geomToFeatureCount);
                });
    
                result.push(loadTask);
            });
            
            return result;
        },
        
            
        /**
         * TODO Finishing this method at some point to merge nodes together could be useful
         * 
         */
        finalizeLoading: function(nodes) {
            // Restructure all nodes that have been completely loaded, 
            var parents = [];
            
            $.each(nodes, function(index, node) {
                if(node.parent) {
                    parents.push(node.parent);
                }
            });
    
            parents = _.uniq(parents);
            
            var change = false;         
            do {
                change = false;
                for(var i in parents) {
                    var p = parents[i];
    
                    var children = p.children;
    
                    var didMerge = ns.tryMergeNode(p);
                    if(!didMerge) {
                        continue;
                    }
                    
                    change = true;
    
                    $.each(children, function(i, child) {
                        var indexOf = _.indexOf(nodes, child);
                        if(indexOf >= 0) {
                            nodes[indexOf] = undefined;
                        }
                    });
                    
                    nodes.push(p);
                    
                    if(p.parent) {
                        parents.push(p.parent);
                    }
                    
                    break;
                }
            } while(change == true);
            
            _.compact(nodes);
            
            /*
            $.each(nodes, function(i, node) {
                node.isLoaded = true;
            });
            */
            
            //console.log("All done");
            //self._setNodes(nodes, bounds);
            //callback.success(nodes, bounds);      
        },

    
        /**
         * TODO Make sure we never need this method again.
         * 
         * Extracts labels and geometries from the databanks that were fetched for the nodes 
         * 
         */
        postProcess: function(nodes) {
            var self = this;

            var deferred = $.Deferred();
            
            /*
            deferred.resolve({});

            return deferred;
            */
            
            
            // Here we create an rdfQuery databank object with the information we gathered
            
            var subTasks = _.map(nodes, function(node) {
    
                if(!node.data || !node.data.geomToFeatureCount) {
                    return;
                }
                
    
                
                node.data.graph = $.rdf.databank();
                
                var uriStrs = _.keys(node.data.geomToFeatureCount);
                var uris = _.map(uriStrs, function(uriStr) { return sparql.Node.uri(uriStr); });
                
                
                //console.debug("Post processing uris", uris);

                /*
                var p1 = self.labelFetcher.fetch(uriStrs).pipe(function(data) {
                    //console.log("Labels", data);
                    node.data.geomToLabel = data;
                });
                */
                

                var p2 = self.geomPosFetcher.fetch(uris).pipe(function(data) {
                    //console.log("Positions", data);
                    node.data.geomToPoint = data;
                });
    
                var databank = node.data.graph;
                _.each(node.data.geomToFeatureCount, function(count, geom) {
                    var s = sparql.Node.uri(geom);
                    var o = sparql.Node.typedLit(count, xsd.integer);
                    
                    var tripleStr = "" + s + " " + appvocab.featureCount + " " + o;
                    var triple = $.rdf.triple(tripleStr);
                    
                    databank.add(triple);                   
                });

                
                var subTask = $.when(p2).then(function() {
                    
                    var data = node.data;
                    var geomToLabel = data.geomToLabel;
                    var databank = data.graph;
                    
                    _.each(geomToLabel, function(label, uri) {
                        var s = sparql.Node.uri(uri);
                        var o = sparql.Node.plainLit(label.value, label.language);
                        
                        var tripleStr = "" + s + " " + rdfs.label + " " + o;
                        var triple = $.rdf.triple(tripleStr);
                        
                        databank.add(triple);
                    });
    
                    var geomToPoint = data.geomToPoint;
                    
                    _.each(geomToPoint, function(point, uri) {
                        var s = sparql.Node.uri(uri);
                        var oLon = sparql.Node.typedLit(point.x, xsd.xdouble.value);
                        var oLat = sparql.Node.typedLit(point.y, xsd.xdouble.value);
                        
                        var lonTriple = "" + s + " " + geo.lon + " " + oLon; 
                        var latTriple = "" + s + " " + geo.lat + " " + oLat;
                        
                        //alert(lonTriple + " ---- " + latTriple);
                        
                        databank.add(lonTriple);
                        databank.add(latTriple);
                    });
                });
                
                return subTask;         
            });
            
            $.when.apply(window, subTasks).then(function() {
                deferred.resolve();
            });
            
            return deferred.promise();
        }


    
    });

    /**
     * 
     * 
     * @param parent
     * @returns {Boolean} true if the node was merged, false otherwise
     */
    ns.tryMergeNode = function(parent) {
        return false;
        
        if(!parent) {
            return;
        }
    
        // If all children are loaded, and the total number
        var itemCount = 0;
        for(var i in parent.children) {
            var child = parent.children[i];
            
            if(!child.isLoaded) {
                return false;
            }
            
            itemCount += child.itemCount;
        }
        
        if(itemCount >= self.maxItemsPerTileCount) {
            return false;
        }
        
        parent.isLoaded = true;
    
        for(var i in parent.children) {
            var child = parent.children[i];
            
            mergeMapsInPlace(parent.idToPos, child.idToPos);
            
            mergeMapsInPlace(parent.data.idToLabels, child.data.idToLabels);
            mergeMapsInPlace(parent.data.idToTypes, child.data.idToTypes);
            
            //parent.data.ids.addAll(child.data.ids);
            //parent.data.addAll(child.data);
        }
        
        
        // Unlink children
        parent.children = null;
        
        console.log("Merged a node");
        
        return true;
    };


    
    
})();