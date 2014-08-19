var Class = require('../ext/Class');

var HashMap = require('../util/collection/HashMap');

var NodeUtils = require('../rdf/NodeUtils');
var NodeFactory = require('../rdf/NodeFactory');

var ElementSubQuery = require('../sparql/element/ElementSubQuery');
var ElementUnion = require('../sparql/element/ElementUnion');
var ElementFilter = require('../sparql/element/ElementFilter');
var ElementGroup = require('../sparql/element/ElementGroup');
var Query = require('../sparql/Query');

var Concept = require('../sparql/Concept');
var ConceptUtils = require('../sparql/ConceptUtils');

var ExprVar = require('../sparql/expr/ExprVar');
var E_OneOf = require('../sparql/expr/E_OneOf');

//var ListServiceConcept = require('../service/list_service/ListServiceConcept');
var ListServiceSparqlQuery = require('../service/list_service/ListServiceSparqlQuery');

//var FacetService = require('./FacetService');
var LookupService = require('../service/lookup_service/LookupService');
var FacetUtils = require('./FacetUtils');

var Relation = require('../sparql/Relation');
var RelationUtils = require('../sparql/RelationUtils');
var VarUtils = require('../sparql/VarUtils');


var AggMap = require('../sponate/agg/AggMap');
var AggTransform = require('../sponate/agg/AggTransform');
var AggLiteral = require('../sponate/agg/AggLiteral');
var BindingMapperExpr = require('../sponate/binding_mapper/BindingMapperExpr');
var LookupServiceUtils = require('../sponate/LookupServiceUtils');
var ServiceUtils = require('../sponate/ServiceUtils');

var shared = require('../util/shared');
var Promise = shared.Promise;

var QueryUtils = require('../sparql/QueryUtils');

var CountUtils = {
    createAggMapCount: function(sourceVar, targetVar) {
        //var result = new AggTransform(new AggLiteral(new BindingMapperExpr(new ExprVar(targetVar))), NodeUtils.getValue);
        var result =
            new AggMap(
                new BindingMapperExpr(new ExprVar(sourceVar)),
                new AggTransform(new AggLiteral(new BindingMapperExpr(new ExprVar(targetVar))), NodeUtils.getValue));
        
        return result;
    },

    execQueries: function(sparqlService, subQueries, sourceVar, targetVar) {
        var query = QueryUtils.createQueryUnionSubQueries(subQueries, [sourceVar, targetVar]);
        
        var result;
        if(query) {        
            var agg = this.createAggMapCount(sourceVar, targetVar);
            result = ServiceUtils.execAgg(sparqlService, query, agg);
            //var ls = LookupServiceUtils.createLookupServiceAgg(sparqlService, query, sourceVar, agg);
            //result = ls.lookup(); // unconstrained lookup
        } else {
            result = Promise.resolve(new HashMap());
        }
        
        return result;
    },
        
    createQueriesPreCount: function(sourceVar, countVar, propertyToRelation, fallbackRelation, properties, rowLimit) {
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
    },

    createQueriesExactCount: function(sourceVar, countVar, propertyToRelation, fallbackRelation, properties) {
    
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
    },

};

module.exports = CountUtils;
