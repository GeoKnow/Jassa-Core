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

//var FacetService = require('./FacetService');
var LookupService = require('../../service/lookup_service/LookupService');
var FacetUtils = require('../FacetUtils');

var RelationUtils = require('../../sparql/RelationUtils');
var VarUtils = require('../../sparql/VarUtils');

var shared = require('../../util/shared');
var Promise = shared.Promise;


var LookupServiceFacetCount = Class.create(LookupService, {
    initialize: function(sparqlService, sourceVar, propertyToRelation, fallbackRelation) {
        this.sparqlService = sparqlService;
        this.sourceVar = sourceVar; // The assumption is that all relations have this var as the sourceVar

        this.propertyToRelation = propertyToRelation;
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
                var subElements = subQueries.map(function(subQuery) {
                    var r = new ElementSubQuery(subQuery); 
                    return r;
                });

                var union = new ElementUnion(subElements);
                
                query = new Query();
                query.setQuerySelectType();
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


module.exports = LookupServiceFacetCount;
