var Class = require('../../ext/Class');

var Concept = require('../../sparql/Concept');
var ConceptUtils = require('../../sparql/ConceptUtils');

//var ListServiceConcept = require('../../service/list_service/ListServiceConcept');
var ListServiceSparqlQuery = require('../../service/list_service/ListServiceSparqlQuery');
var ListServiceTransformItem = require('../../service/list_service/ListServiceTransformItem');

var FacetService = require('./FacetService');
var FacetUtils = require('../FacetUtils');

var RelationUtils = require('../../sparql/RelationUtils');
var VarUtils = require('../../sparql/VarUtils');

var shared = require('../../util/shared');
var Promise = shared.Promise;

/*
var properties = [];
entries.forEach(function(entry) {
    properties.push(entry.key);
});
*/

var FacetServiceSparql = Class.create(FacetService, {
    initialize: function(sparqlService, facetConceptSupplier) {
        this.sparqlService = sparqlService;
        this.facetConceptSupplier = facetConceptSupplier;
    },

    /**
     * Returns a list service, that yields JSON documents of the following form:
     * {
     *   id: property {jassa.rdf.Node},
     *   countInfo: { count: , hasMoreItems: true/false/null }
     * }
     */
    createListService: function(pathHead) {
        // TODO We probably want a FacetRelationSupplier here:
        // This object could then return different concepts for the paths

        //var relation = FacetUtils.createRelationFacets(this.facetConfig, path, isInverse);
        //var concept = new Concept(relation.getElement(), relation.getSourceVar());

        var concept = this.facetConceptSupplier.getConcept(pathHead);

        var query = ConceptUtils.createQueryList(concept);

        var listService = new ListServiceSparqlQuery(this.sparqlService, query, concept.getVar(), false);
        listService = new ListServiceTransformItem(listService, function(entry) { return entry.key; });

        var result = Promise.resolve(listService);

        return result;
    },

});

module.exports = FacetServiceSparql;
