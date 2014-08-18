var HashMap = require('../util/collection/HashMap');

var NodeFactory = require('../rdf/NodeFactory');

var Concept = require('../sparql/Concept');
var ConceptUtils = require('../sparql/ConceptUtils');
var FacetUtils = require('./FacetUtils');

var LookupServiceFacetCount = require('./lookup_service/LookupServiceFacetCount');

var ListServiceSparqlQuery = require('../service/list_service/ListServiceSparqlQuery');

var ServiceUtils = {
    createLookupServiceFacetCount: function(sparqlService, facetConfig, path, isInverse) {
        //var sourceVar = facetConfig.getRootFacetNode().forPath(path).getVar();

        var stepRelations = FacetUtils.createStepRelationsProperties(facetConfig, path, isInverse, [], true);

        // Retrieve the variable of the step relations
        // Note: all relations are assumed to use the same source var
        var sourceVar = stepRelations.length > 0 ? stepRelations[0].getRelation().getSourceVar() : null;
        
        // index by step.property
        var propertyToRelation = new HashMap();
        
        var fallbackRelation = null;
        stepRelations.forEach(function(sr) {
            var step = sr.getStep();
            var relation = sr.getRelation();

            var p = step ? NodeFactory.createUri(step.getPropertyName()) : null;
            if(p) {
                propertyToRelation.put(p, relation);
            } else {
                fallbackRelation = relation;
            }
        });
        
        var result = new LookupServiceFacetCount(sparqlService, sourceVar, propertyToRelation, fallbackRelation);
        
        return result;
    },
        
};

module.exports = ServiceUtils;


//
////FacetConceptUtils.createConceptFacets(path, isInverse)
//// TODO We probably want a FacetRelationSupplier here:
//// This object could then return different concepts for the paths
//var relation = FacetUtils.createRelationFacets(this.facetConfig, path, isInverse);
//
//
//
//console.log('CREATED RELATION: ' + relation);
//
//var concept = new Concept(relation.getElement(), relation.getSourceVar());
//
//
////var propertyListService = new ListServiceSparqlQuery(this.sparqlService, query, concept.getVar(), false);
//
//
////
////var stepRelations = FacetUtils.createRelationsFacetValues(this.facetConfig, path, isInverse, [], true);
////
//////var countVar = NodeFactory.createVar(/'c');
////stepRelations.forEach(function(stepRelation) {
////    var x = RelationUtils.createQueryDistinctValueCount(stepRelation.getRelation(), VarUtils.c);
////    console.log('STEP RELATION: ' + x);
////    
////});
//
//// TODO We could provide an extension point here to order the concept by some criteria 
//
//
////var promise = self.fetchFacetValueCounts(path, isInverse, properties, false);
//
//var query = ConceptUtils.createQueryList(concept);
//
//var result = new ListServiceSparqlQuery(this.sparqlService, query, concept.getVar(), false);
////var result = new ListServiceConcept(this.sparqlService);
//return result;        