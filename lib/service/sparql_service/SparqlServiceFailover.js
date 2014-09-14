var Class = require('../../ext/Class');
var SparqlService = require('./SparqlService');
var QueryExecutionFailover = require('../query_execution/QueryExecutionFailover');

/**
 *
 */
var SparqlServiceFailover = Class.create(SparqlService, {
    initialize: function(sparqlServices) {
        this.sparqlServices = sparqlServices;
    },

    getServiceId: function() {
        return this.sparqlService.getServiceId();
    },

    getStateHash: function() {
        return this.sparqlService.getStateHash();
    },

    hashCode: function() {
        return 'failover:' + this.sparqlService.hashCode();
    },

    createQueryExecution: function(query) {
        return new QueryExecutionFailover(this.sparqlServices);
    },

});

module.exports = SparqlServiceFailover;
