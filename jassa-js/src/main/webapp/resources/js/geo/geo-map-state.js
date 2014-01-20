(function() {
    
    var ns = Jassa.geo;
    
    ns.createMapDiff = function(a, b) {

        var aIds = _(a).keys();
        var bIds = _(b).keys();
        
        var addedIds = _(aIds).difference(bIds);
        var removedIds = _(bIds).difference(aIds);

        var added = _(a).pick(addedIds);
        var remoed = _(b).pick(removedIds);

        var result = {
                added: added,
                removed: removed
        };

        return result;
    };

    
    /**
     * TODO/Note This data should be (also) part of the model I suppose
     */
    ns.ViewState = Class.create({
        initialize: function(nodes, bounds, visibleGeoms, visibleBoxes) {
            this.nodes = nodes;
            this.bounds = bounds; //null; //new qt.Bounds(-9999, -9998, -9999, -9998);
            this.visibleGeoms = visibleGeoms ? visibleGeoms : [];
            
            this.visibleBoxes = visibleBoxes ? visibleBoxes : {};
        },
      
        /**
         * Returns the quad tree nodes intersecting with the viewport
         */
        getNodes: function() {
            return this.nodes;
        },
        
        getBounds: function() {
            return this.bounds;
        }
        
        //getVisibleG
    });

    
    ns.DynamicMapController = Class.create({
        initialize: function(sparqlService, geoMapFactory) {
            this.sparqlService = sparqlService;
            this.geoMapFactory = geoMapFactory;
            
        },
//        
//            //model.on('change:sparqlService change:geoConceptFactory change:bounds', this.refresh, this);
//        
//        refresh: function() {
//            var self = this;
//            var task = this.computeDelta();
//            
//            task.then(function(state) {
//                self.model.set({
//                    state: state
//                });
//            });
//        },

        /**
         * Updates the "resource" and "boxes" field of the model
         * 
         */
        computeDelta: function(bounds, oldViewState) {
            
            var self = this;

            var sparqlService = this.sparqlService;
            var geoMapFactory = this.geoMapFactory;
           
            oldViewState = oldViewState || new ns.ViewState(); 

            var promise = this.fetchGeometries(sparqlService, geoMapFactory, bounds);            

                                    
            var result = promise.pipe(function(nodes) {
                
                // TODO Properly check if an old request is running
                // and schedule the next request
                if(!nodes) {
                    console.log("Skipping refresh because an update is in progress");
                    return;
                }
            

                
                var newViewState = new ns.ViewState(nodes, bounds);
                
                //console.log("[TRACE] Loaded " + nodes.length + " nodes");
                //console.log("[TRACE] Nodes are:", nodes);
                var delta = self.updateViews(oldViewState, newViewState);
                
                data = {
                        oldState: oldViewState,
                        newState: newViewState,
                        delta: delta
                };
                
                self.model.set({viewState: newViewState});

                result.resolve(data);
                
                var r = {
                    
                };
                
                return r;
            });
            
            return result;
        },
        

        /**
         * This function bridges to the quad tree cache
         */
        fetchGeometries: function(sparqlService, geoMapFactory, bounds) {
            // TODO Make this configurable
            var quadTreeConfig = {
                    maxTileItemCount: 150,
                    maxGlobalItemCount: 750
            };

            var geoMap = geoMapFactory.createMapForGlobal();
            
            var serviceHash = sparqlService.getStateHash();         
            var geoConceptHash = geoMap.getElementFactory().createElement().toString();

            var hash = serviceHash + conceptHash; 
            
            //console.log("[DEBUG] Query hash (including facets): " + hash);
            
            var cacheEntry = this.hashToCache[hash];
            if(!cacheEntry) {
                cacheEntry = new ns.QuadTreeCache(sparqlService, geoMapFactory, null, quadTreeConfig);
                this.hashToCache[hash] = cacheEntry;
            }
            
            var result = cacheEntry.fetchData(bounds);
            return result;
        },
        
        
        updateViews: function(newViewState, oldViewState) {
            
            var nodes = newViewState.getNodes();
            var bounds = newViewState.getBounds();
            
            var addedBoxes = [];
            var removedBoxes = [];
            
            var visibleBoxes = {};
            var oldVisibleBoxes = oldViewState.visibleBoxes; 

            
            // If true, shows the box of each node
            var alwaysShowBoxes = false;
            
            for(var i = 0; i < nodes.length; ++i) {
                var node = nodes[i];
                
                if(!node.isLoaded || alwaysShowBoxes) {
                    
                    //console.log("adding a box for", node);
                    var box = {
                        id: node.getBounds().toString(),
                        bounds: node.getBounds()
                    };
                    
                    //addedBoxes.push(box);
                    visibleBoxes[box.id] = box;
                    //this.addBox(node.getBounds().toString(), toOpenLayersBounds(node.getBounds()));
                }
            }
            
            
            viewState.visibleBoxes = visibleBoxes;

            var boxDiff = ns.createMapDiff(visibleBoxes, oldVisibleBoxes);
            
            
            viewState.geomToFeatures = geomToFeatures;

            
            var result = {
                    boxes: {
                        added: boxDiff.added,
                        removed: boxDiff.removed
                    },
                    items: {
                        added: addedGeoms,
                        removed: removedGeoms
                    }
            };

            return result;          
        }
    });
    
})();
