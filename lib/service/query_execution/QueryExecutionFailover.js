var Class = require('../../ext/Class');
var QueryExecution = require('./QueryExecution');
var QueryPaginator = require('../QueryPaginator');
var IteratorArray = require('../../util/collection/IteratorArray');
var ResultSetArrayIteratorBinding = require('../result_set/ResultSetArrayIteratorBinding');
var shared = require('../../util/shared');
var Promise = shared.Promise;


/**
 * TODO Specify and implement the behavior:
 *
 * - Start a new request if the prior one does not return within a specified time
 *     and use the fastest response
 *
 * - If there is an server-error with an endpoint,
 *
 * - Give a chance for an endpoint to recover (e.g. perform retry after a certain amount of time)
 *
 * - Start all queries simultaneously and use the fastest response
 *
 * -> requestDelay parameter
 *
 */
var QueryExecutionFailover = Class.create(QueryExecution, {
    initialize: function(sparqlServices) {
        this.sparqlServices = sparqlServices;
        this.timeoutInMillis = null;
    },

    execSelect: function() {
        var result = this.sparqlServices.createQueryExecution(this.query);
        result.setTimeout(this.timeoutInMillis);

        return result;
    },

    setTimeout: function(timeoutInMillis) {
        this.timeoutInMillis = timeoutInMillis;
    },
});

module.exports = QueryExecutionFailover;
