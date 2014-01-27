(function() {
    
    var ns = Jassa.geo;
    
//    ns.createMapDiff = function(a, b) {
//
//        var aIds = _(a).keys();
//        var bIds = _(b).keys();
//        
//        var addedIds = _(aIds).difference(bIds);
//        var removedIds = _(bIds).difference(aIds);
//
//        var added = _(a).pick(addedIds);
//        var remoed = _(b).pick(removedIds);
//
//        var result = {
//                added: added,
//                removed: removed
//        };
//
//        return result;
//    };

    
    ns.ViewStateUtils = {
        createStateHash: function(sparqlService, geoMap, concept) {
            var serviceHash = sparqlService.getStateHash();         
            var geoHash = JSON.stringify(geoMap); //geoMap.getElementFactory().createElement().toString();
            var conceptHash = '' + concept;

            var result = serviceHash + geoHash + conceptHash;
            return result;
        },

        // TODO This function is generig; move to a better location 
        diffObjects: function(newObjs, oldObjs, idFn) {

            //function(node) {return node.getNodeId(); }
            var newIdToObj = _(newObjs).indexBy(idFn);
            var oldIdToObj = _(oldObjs).indexBy(idFn);
            
            var newIds = _(newIdToObj).keys();
            var oldIds = _(oldIdToObj).keys();
            
            var retainedIds = _(newIds).intersection(oldIds);
            
            var result = {
                retained:  _(oldIdToObj).chain().pick(retainedIds).values().value(),
                added: _(newIdToObj).chain().omit(oldIds).values().value(),
                removed: _(oldIdToObj).chain().omit(newIds).values().value()
            };

            return result;
        },
        
        diffViewStates: function(newViewState, oldViewState) {
            //oldViewState = oldViewState || new ns.ViewState(); 

            var newStateHash = newViewState.getStateHash();
            var oldStateHash = oldViewState ? oldViewState.getStateHash() : '';
            
            var newNodes = newViewState.getNodes();
            var oldNodes = oldViewState ? oldViewState.getNodes() : [];
            
            
            var result;
            
            // If the hashes do not match, replace the whole old state
            if(newStateHash != oldStateHash) {
                result = {
                    retained: [],
                    added: newNodes,
                    removed: oldNodes
                }
            }
            else {
                var idFn = function(node) {
                    var result = node.getId();
                    //console.log('NodeId', result);
                    return result;
                };
                
                result = this.diffObjects(newNodes, oldNodes, idFn);
            }
            return result;
        }        
    };
    
    /**
     * TODO/Note This data should be (also) part of the model I suppose
     */
    ns.ViewState = Class.create({
        initialize: function(sparqlService, geoMap, concept, bounds, nodes) {
            this.sparqlService = sparqlService;
            //this.concept = concept;
            this.geoMap = geoMap;
            this.concept = concept;
            this.bounds = bounds; //null; //new qt.Bounds(-9999, -9998, -9999, -9998);
            this.nodes = nodes;
        },

        getStateHash: function() {
            return ns.ViewStateUtils.createStateHash(this.sparqlService, this.geoMap, this.concept);  
        },

        // TODO Maybe the view state should remain agnostic of service and concept, and
        // instead only reveal the nodes that are part of it
        getSparqlService: function() {
             return this.sparqlService;
        },
        
        getGeoMap: function() {
            return this.geoMap;
        },
//        getConcept: function() {
//            return this.concept;
//        },
        
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

    
    /**
     * TODO Maybe replace sparqlService with sparqlServiceFactory?
     * But then the object would have to deal with services with different state.
     * Or we have a QuadTreeProvider/Factory, that creates QuadTreeObjects as needed,
     * depending on the combined state of the service and concept.
     * - Or we have a factory, that creates a MapCtrl as needed for each given service.
     * I guess the last approach is good enough.
     * 
     * 
     * Hm, rather I would prefer if some 'template' object was returned,
     * that could be instantiated with a service.
     * 
     * mapCtrl.foo(geoMapFactory, conceptFactory).createService(sparqlService);
     * or service.execute(mapping?)
     * 
     */
    ns.ViewStateFetcher = Class.create({
        //initialize: function(sparqlService, geoMapFactory, conceptFactory) {
        initialize: function() {
//            this.sparqlService = sparqlService;
//            this.geoMapFactory = geoMapFactory;
//            this.conceptFactory = conceptFactory;

            //this.conceptToService = {};
            this.hashToCache = {};
        },
        
        //fetchViewState: function(bounds) {
        fetchViewState: function(sparqlService, geoMapFactory, concept, bounds) {
//            var sparqlService = this.sparqlService;
//            var geoMapFactory = this.geoMapFactory;
//            var conceptFactory = this.conceptFactory;
            
            
            //var concept = conceptFactory.createConcept();
            
            // TODO Make this configurable
            var quadTreeConfig = {
                    maxItemsPerTileCount: 1000,//150,
                    maxGlobalItemCount: 5000
            };

            var geoMap = geoMapFactory.createMapForGlobal();
            // TODO This should be a concept, I assume
            //var geoConcept = geoMap.createConcept();
            
            var hash = ns.ViewStateUtils.createStateHash(sparqlService, geoMap, concept);
            

            // TODO Combine the concept with the geoConcept...
            
            //var serviceHash = sparqlService.getStateHash();         
            //var geoConceptHash = geoMap.getElementFactory().createElement().toString();

            
            //console.log("[DEBUG] Query hash (including facets): " + hash);
            
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
    
    
    
})();
