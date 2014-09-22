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

var Step = require('../Step');

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
    prepareListService: function(pathHead) {
        var concept = this.facetConceptSupplier.getConcept(pathHead);

        var query = ConceptUtils.createQueryList(concept);

        var listService = new ListServiceSparqlQuery(this.sparqlService, query, concept.getVar(), false);
        listService = new ListServiceTransformItem(listService, function(entry) {

            // Replace the keys with the appropriate paths
            var id = entry.key;

            // TODO DESIGN ISSUE Should the ids here be the property nodes or the whole paths?
            // It seems the property nodes makes life easier on this level; but only time will tell
            // So for now we use the key as the ID but already compute the path attribute here
            var step = new Step(id.getUri(), pathHead.isInverse());
            var path = pathHead.getPath().copyAppendStep(step);

            var r = {
              key: id,
              val: {
                  path: path,
                  property: id
              }
          };

            // Create steps from the properties

//            var r = {
//                key: path,
//                val: {
//                    path: path,
//                    property: entry.key
//                }
//            };

            return r;
        });

        var result = Promise.resolve(listService);

        return result;
    },

});

module.exports = FacetServiceSparql;
