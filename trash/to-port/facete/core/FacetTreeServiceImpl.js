

/**
 * For each path in the facet tree, 
 */
FacetServiceSupplier

/**
 * A function that must return the status of a facet node at a given path
 */
NodeConfigSupplier = Class.create({
    getNodeState: function(path) {
        
    }
});

FacetConfig = Class.create({
    initialize: function() {
        // optional: this.path this config corresponds to
        this.concept;
        this.isExpanded;
        this.direction; // the direction this node is facing in case it is expanded
    }
});

var FacetTreeServiceImpl = Class.create({



/**
 * The heart of facete: the service that generates the facet tree
 */
var FacetTreeServiceImpl = Class.create({
    initialize: function(facetConfigSupplier) {
        this.nodeConfigSupplier = nodeConfigSupplier;
    },
    

    fetchFacetTree: function(path) {

        var parentFacetItem;

        if(path.isEmpty()) {
            parentFacetItem = new ns.FacetItem(path, rdf.NodeFactory.createUri('http://root'), null);
        } else {
            parentFacetItem = new ns.FacetItem(path, rdf.NodeFactory.createUri(path.getLastStep().getPropertyName()), null);                
        }

        parentFacetItem.setDoc({
            displayLabel: 'Items'
        });

        // Apply tags for the root element
        var tags = this.facetService.getTags(path);
        parentFacetItem.setTags(tags);

        var result = this.fetchFacetTreeRec(path, parentFacetItem);

		return result;
	},
		
		fetchFavFacets: function(paths) {
		    var self = this;
		    var promises = _(paths).map(function(path) {
		       var parentFacetItem = new ns.FacetItem(path, rdf.NodeFactory.createUri(path.getLastStep().getPropertyName()), null);
		       var r =  self.fetchFacetTreeRec(path, parentFacetItem);
		       return r;
		    });
		    
		    
		    var result = $.Deferred();
		    $.when.apply(window, promises).done(function() {
                var r = _(arguments).map(function(item) {
                    return item;
                });
                
		        result.resolve(r);
		    }).fail(result.fail);
		    
		    
		    return result.promise();
		},
		
		
		
		/**
		 * Returns Promise<List<FacetItem>>
		 * 
		 */
		fetchFacetTreeChildren: function(path, isInverse) {

		    var baseData = {
		            path: path,
		            children: [],
		            limit: null,
		            offset: null
		    };
		        
            //baseData.children = [];
            
            var limit = null;
            var offset = null;

            var state = this.facetStateProvider.getFacetState(path);
            
            if(state) {
                var resultRange = state.getResultRange();
                
                limit = resultRange.getLimit();
                offset = resultRange.getOffset() || 0;
            }


            baseData.limit = limit;
            baseData.offset = offset;


            var filterString = this.pathToFilterString.get(path);
            var baseFlow = this.facetService.createFlow(path, isInverse, filterString);

            var countPromise = baseFlow.count();
            
            //var countPromise = this.facetService.fetchFacetCount(path, false);
            //var childFacetsPromise = this.facetService.fetchFacets(path, false, limit, offset);
            
            var dataFlow = baseFlow.skip(offset).limit(limit);
            
            // TODO How to decide whether to fetch forward or backward facets?
            
            //var childFacetsPromise = this.facetService.fetchFacetsFromFlow(dataFlow, path, false);
            //var childFacetsPromise = this.facetService.fetchFacetsFromFlow(dataFlow, pathHead.getPath(), pathHead.isInverse());
            var childFacetsPromise = this.facetService.fetchFacetsFromFlow(dataFlow, path, isInverse);


            var promises = [countPromise, childFacetsPromise];
            
             
            var result = $.Deferred();
            var self = this;
            $.when.apply(window, promises).pipe(function(childFacetCount, facetItems) {
//console.log('facetItems:', facetItems);
                baseData.childFacetCount = childFacetCount;
                
                var o = limit ? Math.floor((offset || 0) / limit) : 0; 
                
                baseData.pageIndex = 1 + o;
                baseData.pageCount = 1 + (limit ? Math.floor(childFacetCount / limit) : 0);
                
                var childPromises = _(facetItems).map(function(facetItem) {
                    var path = facetItem.getPath();

                    var childPromise = self.fetchFacetTreeRec(path, facetItem);
                    //.pipe(function(childItem) {
                    //});

                    return childPromise;
                });

                
                $.when.apply(window, childPromises).done(function() {
                    _(arguments).each(function(childItem) {
                        baseData.children.push(childItem);
                    });

                    result.resolve(baseData);
                }).fail(function() {
                    result.fail();
                });
                
            });                
		  
            return result;
		},
		
	    /**
         * Given a path, this method fetches all child facets at its target location.
         * 
         * Note that there are 2 components involved:
         * Fetching the child facets
         * 
         * @param facetItem Information about the path leading to this recursion,
         *        such as: count of distinct facet values
         *        null for the root node
         */
		fetchFacetTreeRec: function(path, parentFacetItem) {

		    var isExpanded = this.expansionSet.contains(path);
		    var expansionState = this.expansionMap.get(path);

		    var isOutgoingActive = (expansionState & 1) != 0;
		    var isIncomingActive = (expansionState & 2) != 0;

            // This is the basic information returned for non-expanded facets
            var baseData = {
                item: parentFacetItem,
                isExpanded: isExpanded,
                expansionState: expansionState,
                isOutgoingActive: isOutgoingActive,
                isIncomingActive: isIncomingActive, 
                //state: facetState,
                incoming: null,
                outgoing: null
            };

//            if(isIncomingActive) {
//                console.log('WHAAAAAAAAAAT?');
//            }
            
            var self = this;
            
            
            var result = $.Deferred();
            
            var promises = [];

            if(isExpanded) {
                
                if(isOutgoingActive) { // outgoing
                    var promise = this.fetchFacetTreeChildren(path, false).pipe(function(childData) {
                       baseData.outgoing = childData; 
                    });
                    
                    promises.push(promise);
                }
                
                if(isIncomingActive) { // incoming
                    var promise = this.fetchFacetTreeChildren(path, true).pipe(function(childData) {
                       baseData.incoming = childData; 
                    });
                    promises.push(promise);
                }
            }
            
            $.when.apply(window, promises).done(function() {
                result.resolve(baseData);
            });
            
            return result.promise();
		},
		


