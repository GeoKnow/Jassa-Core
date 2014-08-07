var TableService = require('./table-service');
var TableServiceUtils = require('./table-service-utils');

var TableServiceQuery = function(sparqlService, query, timeoutInMillis, secondaryCountLimit) {
    TableService.call(this);

    this.initialize(sparqlService, query, timeoutInMillis, secondaryCountLimit);
};
// inherit
TableServiceQuery.prototype = Object.create(TableService.prototype);
// hand back the constructor
TableServiceQuery.prototype.constructor = TableServiceQuery;


/**
 * TODO Possibly add primaryCountLimit - i.e. a limit that is never counted beyond, even if the backend might be fast enough
 */
TableServiceQuery.prototype.initialize = function(sparqlService, query, timeoutInMillis, secondaryCountLimit) {
    this.sparqlService = sparqlService;
    this.query = query;
    this.timeoutInMillis = timeoutInMillis || 3000;
    this.secondaryCountLimit = secondaryCountLimit || 1000;
};

TableServiceQuery.prototype.fetchSchema = function() {
    var schema = {
        colDefs: TableServiceUtils.createNgGridOptionsFromQuery(this.query)
    };

    var deferred = $.Deferred();
    deferred.resolve(schema);

    return deferred.promise();
};

TableServiceQuery.prototype.fetchCount = function() {
    var result = TableServiceUtils.fetchCount(this.sparqlService, this.query, this.timeoutInMillis, this.secondaryCountLimit);
    return result;
};

TableServiceQuery.prototype.fetchData = function(limit, offset) {
    var result = TableServiceUtils.fetchData(this.sparqlService, this.query, limit, offset);
    return result;
};

module.exports = TableServiceQuery;