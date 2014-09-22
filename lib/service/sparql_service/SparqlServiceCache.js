var Class = require('../../ext/Class');
var SparqlServiceBaseString = require('./SparqlServiceBaseString');
var RequestCache = require('../RequestCache');
var QueryExecutionCache = require('../query_execution/QueryExecutionCache');

/**
 * Result Cache stores result sets - this is an instance of a class
 *
 * Execution Cache holds all running queries' promises - this is just an associative array - i.e. {}
 * Once the promises are resolved, the corresponding entries are removed from the execution cache
 *
 * TODO Its not really a cache but more a registry
 *
 */
var SparqlServiceCache = Class.create(SparqlServiceBaseString, {
    initialize: function(sparqlService, requestCache) { // , resultCache, executionCache) {
        this.sparqlService = sparqlService;
        this.requestCache = requestCache || new RequestCache();
    },

    getServiceId: function() {
        return this.sparqlService.getServiceId();
    },

    getStateHash: function() {
        return this.sparqlService.getStateHash();
    },

    hashCode: function() {
        return 'cached:' + this.sparqlService.hashCode();
    },

    createQueryExecutionStr: function(queryStr) {
        var serviceId = this.sparqlService.getServiceId();
        var stateHash = this.sparqlService.getStateHash();

        var cacheKey = serviceId + '-' + stateHash + queryStr;

        var qe = this.sparqlService.createQueryExecution(queryStr);

        var result = new QueryExecutionCache(qe, cacheKey, this.requestCache);

        return result;
    },
});

module.exports = SparqlServiceCache;
