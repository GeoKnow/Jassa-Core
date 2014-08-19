var Class = require('../../ext/Class');

var VarUtils = require('../../sparql/VarUtils');
var CountUtils = require('../CountUtils');

var LookupService = require('../../service/lookup_service/LookupService');

var LookupServiceFacetExactCount = Class.create(LookupService, {
    initialize: function(sparqlService, sourceVar, propertyToRelation, fallbackRelation) {
        this.sparqlService = sparqlService;
        this.sourceVar = sourceVar; // The assumption is that all relations have this var as the sourceVar

        this.propertyToRelation = propertyToRelation;
        this.fallbackRelation = fallbackRelation;
    },

    lookup: function(properties) {
        var countVar = VarUtils.c;
        var subQueries = CountUtils.createQueriesExactCount(this.sourceVar, countVar, this.propertyToRelation, this.fallbackRelation, properties, this.rowLimit);
        var result = CountUtils.execQueries(this.sparqlService, subQueries, this.sourceVar, countVar);
        return result;
    },
});

module.exports = LookupServiceFacetExactCount;
