var Class = require('../../ext/Class');

var VarUtils = require('../../sparql/VarUtils');
var CountUtils = require('../CountUtils');

var LookupService = require('../../service/lookup_service/LookupService');

//var HashMap = require('../../util/collection/HashMap');
//
//var NodeUtils = require('../../rdf/NodeUtils');
//var NodeFactory = require('../../rdf/NodeFactory');
//
//var ElementSubQuery = require('../../sparql/element/ElementSubQuery');
//var ElementUnion = require('../../sparql/element/ElementUnion');
//var ElementFilter = require('../../sparql/element/ElementFilter');
//var ElementGroup = require('../../sparql/element/ElementGroup');
//var Query = require('../../sparql/Query');
//
//var Concept = require('../../sparql/Concept');
//var ConceptUtils = require('../../sparql/ConceptUtils');
//
//var ExprVar = require('../../sparql/expr/ExprVar');
//var E_OneOf = require('../../sparql/expr/E_OneOf');
//
////var ListServiceConcept = require('../../service/list_service/ListServiceConcept');
//var ListServiceSparqlQuery = require('../../service/list_service/ListServiceSparqlQuery');
//
////var FacetService = require('./FacetService');
//var FacetUtils = require('../FacetUtils');
//
//var Relation = require('../../sparql/Relation');
//var RelationUtils = require('../../sparql/RelationUtils');
//
//
//var AggMap = require('../../sponate/agg/AggMap');
//var AggTransform = require('../../sponate/agg/AggTransform');
//var AggLiteral = require('../../sponate/agg/AggLiteral');
//var BindingMapperExpr = require('../../sponate/binding_mapper/BindingMapperExpr');
//var LookupServiceUtils = require('../../sponate/LookupServiceUtils');
//var ServiceUtils = require('../../sponate/ServiceUtils');
//
//var shared = require('../../util/shared');
//var Promise = shared.Promise;



var LookupServiceFacetPreCount = Class.create(LookupService, {
    initialize: function(sparqlService, sourceVar, propertyToRelation, fallbackRelation) {
        this.sparqlService = sparqlService;
        this.sourceVar = sourceVar; // The assumption is that all relations have this var as the sourceVar

        this.propertyToRelation = propertyToRelation;
        this.fallbackRelation = fallbackRelation;
        this.rowLimit = 10000;
    },

    lookup: function(properties) {
        var countVar = VarUtils.c;
        var subQueries = CountUtils.createQueriesPreCount(this.sourceVar, countVar, this.propertyToRelation, this.fallbackRelation, properties, this.rowLimit);
        var result = CountUtils.execQueries(this.sparqlService, subQueries, this.sourceVar, countVar);
        return result;
    },

});


module.exports = LookupServiceFacetPreCount;
