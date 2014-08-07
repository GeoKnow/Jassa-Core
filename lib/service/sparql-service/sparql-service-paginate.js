var SparqlService = require('./sparql-service');
var QueryExecutionPaginate = require('../query-execution').Paginate;

/**
 * Utility class to create an iterator over an array.
 *
 */
var SparqlServicePaginate = function(sparqlService, query, pageSize) {
    SparqlService.call(this);

    this.defaultPageSize = 1000;

    this.initialize(sparqlService, query, pageSize);
};
// inherit
SparqlServicePaginate.prototype = Object.create(SparqlService.prototype);
// hand back the constructor
SparqlServicePaginate.prototype.constructor = SparqlServicePaginate;



SparqlServicePaginate.prototype.initialize = function(sparqlService, pageSize) {
    this.sparqlService = sparqlService;
    this.pageSize = pageSize;
};

SparqlServicePaginate.prototype.getServiceId = function() {
    return this.sparqlService.getServiceId();
};

SparqlServicePaginate.prototype.getStateHash = function() {
    return this.sparqlService.getStateHash();
};

SparqlServicePaginate.prototype.hashCode = function() {
    return 'paginate:' + this.sparqlService.hashCode();
};

SparqlServicePaginate.prototype.createQueryExecution = function(query) {
    var result = new QueryExecutionPaginate(this.sparqlService, query, this.pageSize);
    return result;
};

module.exports = SparqlServicePaginate;
