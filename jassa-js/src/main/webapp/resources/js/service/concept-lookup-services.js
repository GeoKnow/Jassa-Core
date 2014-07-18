(function() {

    var util = jassa.util;
    var facete = jassa.facete;
    var geo = jassa.geo;
    var sponate = jassa.sponate;
    var facete = jassa.facete;
    
    var ns = jassa.service;

    /**
     * A data service only provides a single method for retrieving data based on some 'key' (thing)
     * The key can be an arbitrary object that identifies a collection (e.g. a tag), a sparql concept, etc...
     */
    ns.DataService = Class.create({
        fetchData: function(thing) {
            console.log('Not implemented');
            throw 'Not implemented';
        }       
    });

    /**
     * A list service supports fetching ranges of items and supports thresholded counting.
     */
    ns.ListService = Class.create({
        fetchItems: function(thing, limit, offset) {
            console.log('Not implemented');
            throw 'Not implemented';
        },
        
        fetchCount: function(thing, threshold) {
            console.log('Not implemented');
            throw 'Not implemented';            
        }
    });
    
    
    ns.ListServiceBbox = Class.create(ns.ListService, {
        initialize: function(sparqlService, geoMapFactory, concept) {
            this.sparqlService = sparqlService;
            this.geoMapFactory = geoMapFactory;
            this.concept = concept;
            
            // this.fnGetBBox = fnGetBBox || defaultDocWktExtractorFn;
            // TODO How to augment the data provided by the geoMapFactory?
        },

        createFlow: function(bounds) {
            var store = new sponate.StoreFacade(this.sparqlService); // ,
                                                                        // prefixes);
            var geoMap = this.geoMapFactory.createMap(bounds);
            store.addMap(geoMap, 'geoMap');
            return store.geoMap;            
        },    

        fetchItems: function(bounds, limit, offset) {
            var loadFlow = this.createFlow(bounds).find().concept(this.concept).limit(limit).offset(offset);
            var result = loadFlow.asList(true);
            return result;

//            var promises = _(boundsArray).each(function(bounds) {
//                var loadFlow = self.createFlow(bounds).find().concept(self.concept).limit(limit).offset(offset);
//                var r = loadFlow.asList(true);
//                return r;
//            });
//          var result = this.zip(boundsArray, promises);            
//          return result;
        
        },
        
        fetchCount: function(bounds, threshold) {
            var countFlow = this.createFlow(bounds).find().concept(this.concept).limit(threshold);
            var result = countFlow.count();
            return result;

//            var self = this;
//            var promises = _(boundsArray).each(function(bounds) {
//                var countFlow = self.createFlow(bounds).find().concept(self.concept).limit(countThreshold);
//                var r = countFlow.count();
//                return r;
//            });
//            
//            var result = this.zip(boundsArray, promises);            
//            return result;
        }
    });

/*
    ns.ListServiceBBoxStrategy = Class.create(ns.ListService, {
        initialize: function(strategy) {
            this.strategy = strategy;
        },
        
        fetchItems: function() {
            
        },
        
        fetchCount: function() {
            strategy.runWorkflow()
        }
    });
*/

    
    /*
    ns.ClusterService = Class.create({
        fetchClusters: function(bounds, limit, offset) {
        }
    });
*/
    
    /**
     * Adds a quad tree cache to the lookup service
     */
    ns.DataServiceBboxCache = Class.create({
        initialize: function(listServiceBbox, maxGlobalItemCount, maxItemsPerTileCount, aquireDepth) {
            this.listServiceBbox = listServiceBbox;
            
            var maxBounds = new geo.Bounds(-180.0, -90.0, 180.0, 90.0);
            this.quadTree = new geo.QuadTree(maxBounds, 18, 0);

            this.maxItemsPerTileCount = maxItemsPerTileCount || 25;
            this.maxGlobalItemCount = maxGlobalItemCount || 50;
            this.aquireDepth = aquireDepth || 2;
        },

        // TODO: limit and offset currently ignored
        fetchData: function(bounds) {
            var result = this.runWorkflow(bounds).pipe(function(nodes) {
                var arrayOfDocs = _(nodes).map(function(node) {
                    return node.data.docs; 
                });
                
                // Remove null items
                var docs = _(arrayOfDocs).compact();
                docs = _(docs).flatten(true);
                
                
                // Add clusters as regular items to the list??? 
                _(nodes).each(function(node) {                    
                    if(node.isLoaded) {
                        return;
                    }
                    
                    var wkt = geo.GeoExprUtils.boundsToWkt(node.getBounds());
                    
                    var cluster = {
                        id: wkt,
                        //type: 'cluster',
                        //isZoomCluster: true,
                        zoomClusterBounds: node.getBounds(),
                        wkt: rdf.NodeFactory.createPlainLiteral(wkt)
                    };
                    
                    docs.push(cluster);
                });
                    
                    
                return docs;
            });
            
            return result;
        },
        /*
        fetchCount: function(bounds, threshold) {
            var result = this.listServiceBbox.fetchCount(bounds, threshold);
            return result;
        },
        */
        runCheckGlobal: function() {
            var result;
            
            var rootNode = this.quadTree.getRootNode();

            var self = this;
            if(!rootNode.checkedGlobal) {
            
                var countTask = this.listServiceBbox.fetchCount(null, this.maxGlobalItemCount);
                
                // var countFlow =
                // this.createFlowForGlobal().find().concept(this.concept).limit(self.maxGlobalItemCount);
                // var countTask = countFlow.count();
                var globalCheckTask = countTask.pipe(function(countInfo) {
                    var canUseGlobal = !countInfo.hasMoreItems;
                    console.debug("Global check counts", countInfo);
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
        },
        
        runWorkflow: function(bounds) {
            
            var deferred = $.Deferred();
            
            var rootNode = this.quadTree.getRootNode();
            
            var self = this;
            this.runCheckGlobal().pipe(function(canUseGlobal) {
                console.log('Can use global? ', canUseGlobal);
                var task;
                if(canUseGlobal) {
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
        },
    
        runGlobalWorkflow: function(node) {
        
            var self = this;

            var result = this.listServiceBbox.fetchItems(null).pipe(function(docs) { 
                // console.log("Global fetching: ", geomToFeatureCount);
                self.loadTaskAction(node, docs);
                
                return [node];
            });
    
            /*
             * loadTask.done(function() {
             * $.when(self.postProcess([node])).done(function() {
             * //console.log("Global workflow completed.");
             * //console.debug("Workflow completed. Resolving deferred.");
             * result.resolve([node]); }).fail(function() { result.fail(); });
             * }).fail(function() { result.fail(); });
             */
    
            return result;
        },
        
        
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
        runTiledWorkflow: function(bounds) {
            var self = this;

            //console.log("Aquiring nodes for " + bounds);
            var nodes = this.quadTree.aquireNodes(bounds, this.aquireDepth);

            // console.log('Done aquiring');
            
            // Init the data attribute if needed
            _(nodes).each(function(node) {
                if(!node.data) {
                    node.data = {};
                }
            });
            
    
            // Mark empty nodes as loaded
            _(nodes).each(function(node) {
                if(node.isCountComplete() && node.infMinItemCount === 0) {
                    node.isLoaded = true;
                }
            });
    
            
            var uncountedNodes = _(nodes).filter(function(node) { return self.isCountingNeeded(node); });
            // console.log("# uncounted nodes", uncountedNodes.length);
    
            // The deferred is only resolved once the whole workflow completed
            var result = $.Deferred();
    
            
            var countTasks = this.createCountTasks(uncountedNodes);
            
            $.when.apply(window, countTasks).done(function() {
                var nonLoadedNodes = _(nodes).filter(function(node) { return self.isLoadingNeeded(node); });
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
        },

        
        
        
        createCountTask: function(node) {

            var self = this;
            var threshold = self.maxItemsPerTileCount ? self.maxItemsPerTileCount + 1 : null;

            
            var countPromise = this.listServiceBbox.fetchCount(node.getBounds(), threshold);
            var result = countPromise.pipe(function(itemCountInfo) {
                var itemCount = itemCountInfo.count;
                node.setMinItemCount(itemCountInfo.count); 
                
                // If the value is 0, also mark the node as loaded
                if(itemCount === 0) {
                    // self.initNode(node);
                    node.isLoaded = true;
                }
            });
            
            
            // var countFlow =
            // this.createFlowForBounds(node.getBounds()).find().concept(this.concept).limit(limit);
            // var result = countFlow.count().pipe(function(itemCountInfo) {
         
            return result;
        },
    
        /**
         * If either the minimum number of items in the node is above the
         * threshold or all children have been counted, then there is NO need
         * for counting
         * 
         */
        isCountingNeeded: function(node) {
            // console.log("Node To Count:", node, node.isCountComplete());
            return !(this.isTooManyGeoms(node) || node.isCountComplete());
        },
    
    

        /**
         * Loading is needed if NONE of the following criteria applies: . node
         * was already loaded . there are no items in the node . there are to
         * many items in the node
         * 
         */
        isLoadingNeeded: function(node) {
    
            // (node.data && node.data.isLoaded)
            var noLoadingNeeded = node.isLoaded || (node.isCountComplete() && node.infMinItemCount === 0) || this.isTooManyGeoms(node);
            
            return !noLoadingNeeded;
        },
    
    
        isTooManyGeoms: function(node) {    
            // console.log("FFS", node.infMinItemCount, node.getMinItemCount());
            return node.infMinItemCount >= this.maxItemsPerTileCount;
        },
        
    
    
        createCountTasks: function(nodes) {
            var self = this;
            var result = _(nodes).chain()
                .map(function(node) {
                    return self.createCountTask(node);
                })
                .compact() // Remove null entries
                .value();
            
            /*
             * var result = []; $.each(nodes, function(i, node) { var task =
             * self.createCountTask(node); if(task) { result.push(task); } });
             */
    
            return result;
        },    
    
        /**
         * Sets the node's state to loaded, attaches the geomToFeatureCount to
         * it.
         * 
         * @param node
         * @param geomToFeatureCount
         */
        loadTaskAction: function(node, docs) {
            // console.log('Data for ' + node.getBounds() + ': ', docs);
            node.data.docs = docs;
            node.isLoaded = true;            
        },
        
        createLoadTasks: function(nodes) {
            var self = this;
            var result = [];
                        
            //promises = this.lookupServiceBBox.fetchDataBounds()
            
            
            // $.each(nodes, function(index, node) {
            var result = _(nodes).map(function(node) {
                // console.debug("Inferred minimum item count: ",
                // node.infMinItemCount);
    
                // if(node.data.absoluteGeomToFeatureCount)

                // var loadFlow =
                // self.createFlowForBounds(node.getBounds()).find().concept(self.concept);
                //var loadTask = loadFlow.asList(true).pipe(function(docs) {
                var loadTask = self.listServiceBbox.fetchItems(node.getBounds()).pipe(function(docs) {
                    self.loadTaskAction(node, docs);
                });
    
                return loadTask;
            });
            
            return result;
        },
        
            
        /**
         * TODO Finishing this method at some point to merge nodes together
         * could be useful
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
             * $.each(nodes, function(i, node) { node.isLoaded = true; });
             */
            
            // console.log("All done");
            // self._setNodes(nodes, bounds);
            // callback.success(nodes, bounds);
        }
    });

    
    
    
    /**
     * 
     * 
     */
    ns.ListServiceConceptKeyLookup = Class.create(ns.ListService, {
        // initialize: function(conceptLookupService, keyLookupService) {
        initialize: function(sparqlService, keyLookupService) {
            this.sparqlService = sparqlService;
            this.keyLookupService = keyLookupService;
        },
        
        fetchItems: function(concept, limit, offset) {
            var query = facete.ConceptUtils.createQueryList(concept, limit, offset);
            
            var deferred = jQuery.Deferred();
            
            var self = this;
            ns.ServiceUtils.fetchList(query, concept.getVar()).pipe(function(items) {
                
                self.keyLookupService.lookup(items).pipe(function(map) {
                    deferred.resolve(map);
                }).fail(function() {
                    deferred.fail();
                });
            }).fail(function() {
                deferred.fail();
            });
            
            return deferred.promise();
        },
        
        fetchCount: function(concept, threshold) {
            var result = ns.ServiceUtils.fetchCountConcept(concept, threshold);
            return result;
        }
    });

    
    /**
     * If bounds is null, no restriction on the bbox is assumed
     */
    ns.BBoxLookupService = Class.create({
        lookupBBox: function(bounds) {
            console.log('Not implemented');
            throw 'Not implemented';            
        }
    });
    
    ns.BBoxLookupService = Class.create(ns.BBoxLookupService, {
        
    });
    
    
    
    
    
    
    ns.LookupServiceUtils = {
        /**
         * Create a new promise from a list of keys and corresponding
         * valuePromises
         */
        zip: function(keys, valuePromises) {
            var result = jQuery.when.apply(window, valuePromises).pipe(function() {
                var r = new util.HashMap();
                
                for(var i = 0; i < keys.length; ++i) {
                    var bounds = keys[i];
                    var docs = arguments[i];
                    
                    r.put(bounds, docs);
                }
                
                return r;
            });
            
            return result;
        },
        
        unmapKeys: function(keys, fn, map) {
            var result = new util.HashMap();
            
            _(keys).each(function(key) {
                var k = fn(key);
                
                var v = map.get(k);
                r.put(key, v);
            });

            return result;            
        },
        
        /**
         * Performs a lookup by mapping the keys first
         */
        fetchItemsMapped: function(lookupService, keys, fn) {
            var ks = _(keys).map(fn);

            var result = lookupService.fetchItems(ks).pipe(function(map) {
                var r = ns.LookupServiceUtils.unmapKeys(keys, fn, map);
                return r;
            });
            
            return result;
        },
        
        fetchCountsMapped: function(lookupService, keys, fn) {
            var ks = _(keys).map(fn);

            var result = lookupService.fetchCounts(ks).pipe(function(map) {
                var r = ns.LookupServiceUtils.unmapKeys(keys, fn, map);
                return r;
            });
            
            return result;            
        }
    };
    
    
    ns.ListServiceAugmenter = Class.create(ns.ListService, {
        initialize: function(listService, augmenter) {
            this.listService = listService;
            this.augmenter = augmenter;
        },
        
        fetchItems: function(thing, limit, offset) {
            var deferred = jQuery.Deferred();

            var promise = this.listService.fetchItems(thing);
            var self = this;
            promise.pipe(function(items) {
                //var items = boundsToItems.values();
                
                var p = self.augmenter.augment(items);
                p.done(function() {
                    deferred.resolve(items);
                }).fail(function() {
                    deferred.fail();
                });
            }).fail(function() {
                deferred.fail();
            });
            
            return deferred.promise();
        },
        
        fetchCount: function(thing, threshold) {
            var result = this.listService.fetchCount(thing, threshold);
            return result;
        }
    });
    
    

    
    /**
     * Fetches initial data based on a bbox, and uses this to request additional
     * data from a key lookup service
     * 
     */
    ns.BBoxLookupServiceKeys = Class.create(ns.BBoxLookupService, {
        initialize: function() {
            
        }
    });
    
    
    
    

    
    /**
     * 
     */
    ns.BBoxLookupServiceSupplierDynamic = Class.create({
        initialize: function(sparqlServiceSupplier, geoMapSupplier, conceptSupplier, quadTreeConfig) {
            this.sparqlServiceSupplier = sparqlServiceSupplier;
            this.geoMapSupplier = geoMapSupplier;
            this.conceptSupplier = conceptSupplier;
            this.quadTreeConfig = quadTreeConfig;
            
            // this.conceptToService = {};
            this.hashToCache = {};
        },
        
        fetchItems: function(bounds) {
// var sparqlService = this.sparqlService;
// var geoMapFactory = this.geoMapFactory;
// var conceptFactory = this.conceptFactory;
            quadTreeConfig = quadTreeConfig || {};
            
            _(quadTreeConfig).defaults(ns.ViewStateFetcher.defaultQuadTreeConfig);

            // quadTreeConfig =
            
            // var concept = conceptFactory.createConcept();
            
            // TODO Make this configurable

            var geoMap = geoMapFactory.createMapForGlobal();
            // TODO This should be a concept, I assume
            // var geoConcept = geoMap.createConcept();
            
            var hash = ns.ViewStateUtils.createStateHash(sparqlService, geoMap, concept);
            

            // TODO Combine the concept with the geoConcept...
            
            // var serviceHash = sparqlService.getStateHash();
            // var geoConceptHash =
            // geoMap.getElementFactory().createElement().toString();

            
            // console.log("[DEBUG] Query hash (including facets): " + hash);
            
            var cacheEntry = this.hashToCache[hash];
            if(!cacheEntry) {
                cacheEntry = new ns.QuadTreeCache(sparqlService, geoMapFactory, concept, null, quadTreeConfig);
                this.hashToCache[hash] = cacheEntry;
            }
            
            var nodePromise = cacheEntry.fetchData(bounds);
            
            // Create a new view state object
            var result = nodePromise.pipe(function(nodes) {
                var r = new ns.ViewState(sparqlService, geoMap, concept, bounds, nodes);
                return r;
            });
            
            return result;
        }
    });
    
    /*
    ns.ViewStateFetcher.defaultQuadTreeConfig = {
        maxItemsPerTileCount: 1000,
        maxGlobalItemCount: 5000
    };
    */
    
    /**
     * 
     */
    /*
    ns.LookupServicePremapKeys = Class.create({
        initialize: function(lookupService, itemToKeyFn) {
            this.lookupService = lookupService;
            this.itemToKeyFn = itemToKeyFn;
        },
        
        lookup: function(keys) {
            var promise = ns.LookupServiceUtils.fetchDataMapped(this.lookupService, keys, this.itemToKeyFn);
            var result = promise.pipe(function(map) {
                var r = ns.LookupServiceUtils.unmapKeys(keys, fn, map);
                return r;
            });
            
            return result;
        }
    });
    */
        
    ns.AugmenterLookup = Class.create({
        initialize: function(lookupService, itemToKeyFn, mergeFn) {
            this.lookupService = lookupService;

            this.itemToKeyFn = itemToKeyFn || function(item) {
                return item.id;
            };

            this.mergeFn = mergeFn || function(base, aug) {
                //var r = _(base).defaults(aug);
                var r = _(base).extend(aug);
                return r;
            };
        },
        
        augment: function(items) {
            var deferred = jQuery.Deferred();
            
            var keys = _(items).map(this.itemToKeyFn);
            
            var self = this;
            this.lookupService.lookup(keys).pipe(function(map) {
                
                for(var i = 0; i < keys.length; ++i) {
                    var key = keys[i];
                    var item = items[i];
                    
                    var val = map.get(key);
                    
                    items[i] = self.mergeFn(item, val);
                    //items[i] = mergeFn(item, val);
                }
                
                deferred.resolve(items);
            }).fail(function() {
                deferred.fail();
            });
            
            return deferred.promise();
        }
    });
    
    
})();
