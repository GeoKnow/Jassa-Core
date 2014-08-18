var Class = require('../../ext/Class');

var Concept = require('../../sparql/Concept');
var ConceptUtils = require('../../sparql/ConceptUtils');

//var ListServiceConcept = require('../../service/list_service/ListServiceConcept');
var ListServiceSparqlQuery = require('../../service/list_service/ListServiceSparqlQuery');

var FacetService = require('./FacetService');
var FacetUtils = require('./../FacetUtils');


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
        var relation = FacetUtils.createRelationFacets(this.facetConfig, path, isInverse);
        console.log('CREATED RELATION: ' + relation);

        var concept = new Concept(relation.getElement(), relation.getSourceVar());
        
        // TODO We could provide an extension point here to order the concept by some criteria 


        //var promise = self.fetchFacetValueCounts(path, isInverse, properties, false);

        var query = ConceptUtils.createQueryList(concept);
        
        var result = new ListServiceSparqlQuery(this.sparqlService, query, concept.getVar(), false);
        //var result = new ListServiceConcept(this.sparqlService);
        return result;
    },

});

module.exports = FacetServiceSparql;
