var Class = require('../../ext/Class');

var HashMap = require('../../util/collection/HashMap');

var NodeFactory = require('../../rdf/NodeFactory');

var ElementSubQuery = require('../../sparql/element/ElementSubQuery');
var ElementUnion = require('../../sparql/element/ElementUnion');
var Query = require('../../sparql/Query');

var Concept = require('../../sparql/Concept');
var ConceptUtils = require('../../sparql/ConceptUtils');

//var ListServiceConcept = require('../../service/list_service/ListServiceConcept');
var ListServiceSparqlQuery = require('../../service/list_service/ListServiceSparqlQuery');

var FacetService = require('./FacetService');
var FacetUtils = require('../FacetUtils');

var RelationUtils = require('../../sparql/RelationUtils');
var VarUtils = require('../../sparql/VarUtils');

var shared = require('../util/shared');
var Promise = shared.Promise;


var LookupServiceFacetCount = Class.create(FacetService, {
    initialize: function(sparqlService, sourceVar, propertyToRelation, fallbackRelation) {
        this.sparqlService = this.sparqlService;
        this.sourceVar = sourceVar; // The assumption is that all relations have this var as the sourceVar

        this.propertyToRelation = this.propertyToRelation;
        this.fallbackRelation = fallbackRelation;
    },

    lookup: function(properties) {
        var self = this;

        var rowLimit = 10000;
        var sourceVar = this.sourceVar;
        var countVar = VarUtils.c; 

        // Create the queries
        var subQueries = properties.map(function(property) {
            var relation = self.propertyToRelation.get(property);
            if(!relation) {
                relation = self.fallbackRelation;
            }
            
            var query = RelationUtils.createQueryRawSize(relation, property, countVar, rowLimit);
            return query;
        });
        

        // TODO The following part could probably be factored out into a utility
        var result;
        
        if(subQueries.length === 0) {
            result = Promise.resolve(new HashMap()); // Return an empty map
        } else {
            var query;

            if(subQueries.length === 1) {
                query = subQueries[0];
            } else {
                // Create a union over the sub queries
                var subElements = subQueries.map(function(subquery) {
                    var r = new ElementSubQuery(query); 
                    return r;
                });
                
                var union = new ElementUnion(subElements);
                
                query = new Query();
                query.setQueryTypeSelect();
                query.getProject().add(sourceVar);
                query.getProject().add(countVar);
                query.setQueryPattern(union);
            }
            
            var qe = this.sparqlService.createQueryExecution(query);
            result = qe.execSelect().then(function(rs) {
                var r = new HashMap();
                
                while(rs.hasNext()) {
                    var binding = rs.next();
                    var s = binding.get(sourceVar);
                    var countNode = binding.get(countVar);
                    
                    var count = countNode.getLiteralValue();
                    
                    r.put(s, count);
                }
                
                return r;
            });
        }
        return result;
    },

});



var FacetServiceFacetCounter = Class.create(FacetService, {
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
        var stepRelations = FacetUtils.createStepRelationsProperties(this.facetConfig, path, isInverse, [], true);
        
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
        
        var ls = new LookupServiceFacetCount(this.sparqlService, propertyToRelation, fallbackRelation);
        
        
        //FacetConceptUtils.createConceptFacets(path, isInverse)
        // TODO We probably want a FacetRelationSupplier here:
        // This object could then return different concepts for the paths
        var relation = FacetUtils.createRelationFacets(this.facetConfig, path, isInverse);
        
        
        
        console.log('CREATED RELATION: ' + relation);

        var concept = new Concept(relation.getElement(), relation.getSourceVar());
        
        
        //var propertyListService = new ListServiceSparqlQuery(this.sparqlService, query, concept.getVar(), false);

        
//        
//        var stepRelations = FacetUtils.createRelationsFacetValues(this.facetConfig, path, isInverse, [], true);
//        
//        //var countVar = NodeFactory.createVar(/'c');
//        stepRelations.forEach(function(stepRelation) {
//            var x = RelationUtils.createQueryDistinctValueCount(stepRelation.getRelation(), VarUtils.c);
//            console.log('STEP RELATION: ' + x);
//            
//        });
        
        // TODO We could provide an extension point here to order the concept by some criteria 


        //var promise = self.fetchFacetValueCounts(path, isInverse, properties, false);

        var query = ConceptUtils.createQueryList(concept);
        
        var result = new ListServiceSparqlQuery(this.sparqlService, query, concept.getVar(), false);
        //var result = new ListServiceConcept(this.sparqlService);
        return result;
    },

});

module.exports = FacetServiceFacetCounter;
