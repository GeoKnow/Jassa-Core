var Class = require('../../ext/class');
var TableService = require('./table-service');
var TableServiceUtils = require('./table-service-utils');
var shared = require('../../util/shared');
var Promise = shared.Promise;

var TableServiceQuery = Class.create(TableService, {
    /**
     * TODO Possibly add primaryCountLimit - i.e. a limit that is never counted beyond, even if the backend might be fast enough
     */
    initialize: function(sparqlService, query, timeoutInMillis, secondaryCountLimit) {
        this.sparqlService = sparqlService;
        this.query = query;
        this.timeoutInMillis = timeoutInMillis || 3000;
        this.secondaryCountLimit = secondaryCountLimit || 1000;
    },

    fetchSchema: function() {
        var schema = {
            colDefs: TableServiceUtils.createNgGridOptionsFromQuery(this.query),
        };

        return new Promise(function(resolve) {
            resolve(schema);
        });
    },

    fetchCount: function() {
        var result = TableServiceUtils.fetchCount(this.sparqlService, this.query, this.timeoutInMillis, this.secondaryCountLimit);
        return result;
    },

    fetchData: function(limit, offset) {
        var result = TableServiceUtils.fetchData(this.sparqlService, this.query, limit, offset);
        return result;
    },
});

module.exports = TableServiceQuery;
