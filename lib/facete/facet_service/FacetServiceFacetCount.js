var Class = require('../../ext/Class');

var FacetService = require('./FacetService');

var FacetServiceFacetCount = Class.create(FacetService, {
    initialize: function(sparqlService, facetConfig) {
        this.sparqlService = sparqlService;
        this.facetConfig = facetConfig;
        //this.facetConceptGenerator = facetConceptGenerator;
        
        // TODO We probably need factory functions to get-or-create list services for concepts/queries with certain caps (page expansion, caching)
    },
    
    /**
     * Returns a list service, that yields JSON documents of the following form:
     * { 
     *   id: property {jassa.rdf.Node},
     *   countInfo: { count: , hasMoreItems: true/false/null }
     * }
     */
    createListService: function(path, isInverse) {
        return null;
    },

});

module.exports = FacetServiceFacetCount;
