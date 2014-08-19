var Class = require('../../ext/Class');

/**
 * 
 * This strategy first retrieves 
 * 
 */
var FacetServiceClientIndex = Class.create({
    
    /**
     * Upon request, this facet service will retrieve *all* facets together
     * with their labels. Filtering will then happen in the client.
     * 
     * @param {jassa.facete.FacetService} The underlying facetService
     * 
     */
    initialize: function(facetService, lookupServiceNodeLabels) {
        this.facetService = facetService;
        this.lookupServiceNodeLabels = lookupServiceNodeLabels;
    },
    
    
    /**
     * 
     * @return {ListService[String]} The returned list service accepts a search string  
     */
    createListService: function(pathHead) {
        var ls = this.facetService.createListService(pathHead);
        
        //var properties = ls.fetchItems();
        
        
        
        // TODO Where is the responsibility in doing the label lookup? Probably here.
        // TODO The lookup service for node labels not only has to provide the best labels, but also the 'search labels' or 'hidden labels'
        // We need to decide on the output for the lookup service.
        
        return null;
    }
});

module.exports = FacetServiceClientIndex;