var Class = require('../../ext/Class');
var SparqlService = require('./sparql-service');
var QueryExecutionPaginate = require('../query-execution').Paginate;

/**
 * Utility class to create an iterator over an array.
 *
 */
var SparqlServicePaginate = Class.create(SparqlService, {
    initialize: function(sparqlService, pageSize) {
        this.defaultPageSize = 1000;
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
        return 'paginate:' + this.sparqlService.hashCode();
    },

    createQueryExecution: function(query) {
        var result = new QueryExecutionPaginate(this.sparqlService, query, this.pageSize);
        return result;
    },
});

module.exports = SparqlServicePaginate;
