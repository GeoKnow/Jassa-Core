var Class = require('../../ext/Class');

var HashMap = require('../../util/collection/HashMap');

var NodeUtils = require('../../rdf/NodeUtils');
var NodeFactory = require('../../rdf/NodeFactory');

var ElementSubQuery = require('../../sparql/element/ElementSubQuery');
var ElementUnion = require('../../sparql/element/ElementUnion');
var ElementFilter = require('../../sparql/element/ElementFilter');
var ElementGroup = require('../../sparql/element/ElementGroup');
var Query = require('../../sparql/Query');

var Concept = require('../../sparql/Concept');
var ConceptUtils = require('../../sparql/ConceptUtils');

var ExprVar = require('../../sparql/expr/ExprVar');
var E_OneOf = require('../../sparql/expr/E_OneOf');

//var ListServiceConcept = require('../../service/list_service/ListServiceConcept');
var ListServiceSparqlQuery = require('../../service/list_service/ListServiceSparqlQuery');

//var FacetService = require('./FacetService');
var LookupService = require('../../service/lookup_service/LookupService');
var FacetUtils = require('../FacetUtils');

var Relation = require('../../sparql/Relation');
var RelationUtils = require('../../sparql/RelationUtils');
var VarUtils = require('../../sparql/VarUtils');


var AggMap = require('../../sponate/agg/AggMap');
var AggTransform = require('../../sponate/agg/AggTransform');
var AggLiteral = require('../../sponate/agg/AggLiteral');
var BindingMapperExpr = require('../../sponate/binding_mapper/BindingMapperExpr');
var LookupServiceUtils = require('../../sponate/LookupServiceUtils');
var ServiceUtils = require('../../sponate/ServiceUtils');

var shared = require('../../util/shared');
var Promise = shared.Promise;


var createQueryCombined = function(subQueries, sourceVar, targetVar) {
    var result;
    
    if(subQueries.length === 0) {
        result = null;
    } else {
        if(subQueries.length === 1) {            
            result = subQueries[0];
        } else {
            // Create a union over the sub queries
            var subElements = subQueries.map(function(subQuery) {
                var r = new ElementSubQuery(subQuery); 
                return r;
            });

            var union = new ElementUnion(subElements);
            
            result = new Query();
            result.setQuerySelectType();
            result.getProject().add(sourceVar);
            result.getProject().add(targetVar);
            result.setQueryPattern(union);
        }
    }
    
    return result;
};

var createAggMap = function(sourceVar, targetVar) {
    //var result = new AggTransform(new AggLiteral(new BindingMapperExpr(new ExprVar(targetVar))), NodeUtils.getValue);
    var result =
        new AggMap(
            new BindingMapperExpr(new ExprVar(sourceVar)),
            new AggTransform(new AggLiteral(new BindingMapperExpr(new ExprVar(targetVar))), NodeUtils.getValue));
    
    return result;
};

var execQueries = function(sparqlService, subQueries, sourceVar, targetVar) {
    var query = createQueryCombined(subQueries, sourceVar, targetVar);
    
    var result;
    if(query) {        
        var agg = createAggMap(sourceVar, targetVar);
        result = ServiceUtils.execAgg(sparqlService, query, agg);
        //var ls = LookupServiceUtils.createLookupServiceAgg(sparqlService, query, sourceVar, agg);
        //result = ls.lookup(); // unconstrained lookup
    } else {
        result = Promise.resolve(new HashMap());
    }
    
    return result;
};

var createQueriesPreCount = function(sourceVar, countVar, propertyToRelation, fallbackRelation, properties, rowLimit) {
    // Create the queries
    var result = properties.map(function(property) {
        var relation = propertyToRelation.get(property);
        if(!relation) {
            relation = fallbackRelation;
        }
        
        var r = RelationUtils.createQueryRawSize(relation, property, countVar, rowLimit);
        return r;
    });
    
    return result;
};

var createQueriesExactCount = function(sourceVar, countVar, propertyToRelation, fallbackRelation, properties) {

    var fallbackProperties = [];
    var result = [];

    // If properties map to a relation, we can create the query right away,
    // as this indicates that special constraints apply that do not apply to any other property
    properties.forEach(function(property) {
        var relation = propertyToRelation.get(property);
        if(!relation) {
            fallbackProperties.push(property);
        } else {
            var query = RelationUtils.createQueryDistinctValueCount(relation, countVar);
            result.push(query);
        }
    });
    
    // Those properties that did not map to a relation can be grouped into a single query
    var fr = fallbackRelation;
    var filter = new ElementFilter(new E_OneOf(new ExprVar(sourceVar), fallbackProperties));
    var filteredRel = new Relation(new ElementGroup([fr.getElement(), filter]), fr.getSourceVar(), fr.getTargetVar());
    var fallbackQuery = RelationUtils.createQueryDistinctValueCount(filteredRel, countVar);
    
    result.push(fallbackQuery);

    return result;
};

/*
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
};
*/
/*
var LookupServiceFacetExactCount = Class.create(LookupService, {
    initialize: function(sparqlService, sourceVar, propertyToRelation, fallbackRelation) {
        this.sparqlService = sparqlService;
        this.sourceVar = sourceVar; // The assumption is that all relations have this var as the sourceVar

        this.propertyToRelation = propertyToRelation;
        this.fallbackRelation = fallbackRelation;
    },

    lookup: function(properties) {
 
        var result = execQueries(this.sparqlService, subQueries, sourceVar, countVar);
        return result;
    },

});
*/

/*
var createListServiceAgg = function(sparqlService, query, groupVar, agg) {
    var ls = new ListServiceSparqlQuery(sparqlService, query, groupVar);
    
    createLookupServiceAgg: function(sparqlService, query, groupVar, agg) {
        var ls = new LookupServiceSparqlQuery(sparqlService, query, groupVar);
        var fnTransform = this.createTransformAggResultSetPart(agg);

        var result = new LookupServiceTransform(ls, fnTransform);
        return result;
    },

}
*/

var LookupServiceFacetCount = Class.create(LookupService, {
    initialize: function(sparqlService, sourceVar, propertyToRelation, fallbackRelation) {
        this.sparqlService = sparqlService;
        this.sourceVar = sourceVar; // The assumption is that all relations have this var as the sourceVar

        this.propertyToRelation = propertyToRelation;
        this.fallbackRelation = fallbackRelation;
        this.rowLimit = 10000;
    },

    lookup: function(properties) {
        var countVar = VarUtils.c;
        var subQueries = createQueriesPreCount(this.sourceVar, countVar, this.propertyToRelation, this.fallbackRelation, properties, this.rowLimit);
        var result = execQueries(this.sparqlService, subQueries, this.sourceVar, countVar);
        return result;
    },

});
//        // TODO The following part could probably be factored out into a utility
//        var result;
//        
//        if(subQueries.length === 0) {
//            result = Promise.resolve(new HashMap()); // Return an empty map
//        } else {
//            var query;
//
//            if(subQueries.length === 1) {
//                query = subQueries[0];
//            } else {
//                // Create a union over the sub queries
//                var subElements = subQueries.map(function(subQuery) {
//                    var r = new ElementSubQuery(subQuery); 
//                    return r;
//                });
//
//                var union = new ElementUnion(subElements);
//                
//                query = new Query();
//                query.setQuerySelectType();
//                query.getProject().add(sourceVar);
//                query.getProject().add(countVar);
//                query.setQueryPattern(union);
//            }
//            
//            var qe = this.sparqlService.createQueryExecution(query);
//            result = qe.execSelect().then(function(rs) {
//                var r = new HashMap();
//                
//                while(rs.hasNext()) {
//                    var binding = rs.next();
//                    var s = binding.get(sourceVar);
//                    var countNode = binding.get(countVar);
//                    
//                    var count = countNode.getLiteralValue();
//                    
//                    r.put(s, count);
//                }
//                
//                return r;
//            });
//        }
//        return result;


module.exports = LookupServiceFacetCount;
