var Class = require('../../ext/Class');
var QueryExecutionPageExpand = require('../query_execution/QueryExecutionPageExpand');
var SparqlService = require('./SparqlService');

/**
 * Sparql Service wrapper that expands limit/offset in queries
 * to larger boundaries. Intended to be used in conjunction with a cache.
 *
 */
var SparqlServicePageExpand = Class.create(SparqlService, {
    initialize: function(sparqlService, pageSize) {
        this.sparqlService = sparqlService;
        this.pageSize = pageSize;
    },

    getServiceId: function() {
        return this.sparqlService.getServiceId();
    },
    
    getStateHash: function() {
        return this.sparqlService.getStateHash();
    },

    hashCode: function() {
        return 'page-expand:' + this.sparqlService.hashCode();
    },

    createQueryExecution: function(query) {
        var result = new QueryExecutionPageExpand(this.sparqlService, query, this.pageSize);
        return result;
    }
});

module.exports = SparqlServicePageExpand;
