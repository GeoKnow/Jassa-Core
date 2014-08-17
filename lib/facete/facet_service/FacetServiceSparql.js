var Class = require('../../ext/Class');

var Concept = require('../../sparql/Concept');
var FacetService = require('./FacetService');

var FacetServiceSparql = Class.create(FacetService, {
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
        //FacetConceptUtils.createConceptFacets(path, isInverse)
        // TODO We probably want a FacetRelationSupplier here:
        // This object could then return different concepts for the paths
        var relation = this.createRelationFacets(this.facetConfig, path, isInverse);

        var concept = new Concept(relation.getElement(), relation.getSourceVar());
        
        // TODO We could provide an extension point here to order the concept by some criteria 


        //var promise = self.fetchFacetValueCounts(path, isInverse, properties, false);

        
        
    },

});

module.exports = FacetServiceSparql;
