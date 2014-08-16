var Class = require('../../ext/Class');
var QueryExecution = require('./QueryExecution');
var QueryPaginator = require('../QueryPaginator');
var IteratorArray = require('../../util/collection/IteratorArray');
var ResultSetArrayIteratorBinding = require('../result_set/ResultSetArrayIteratorBinding');
var shared = require('../../util/shared');
var Promise = shared.Promise;

/**
 * Utility class to create an iterator over an array.
 *
 */
var QueryExecutionPaginate = Class.create(QueryExecution, {
    initialize: function(sparqlService, query, pageSize) {
        this.defaultPageSize = 1000;
        this.sparqlService = sparqlService;
        this.query = query;
        this.pageSize = pageSize;
        this.timeoutInMillis = null;
    },

    executeSelectRec: function(queryPaginator, prevResult) {
        var query = queryPaginator.next();
        console.log('Query Pagination: ' + query);
        if (!query) {
            return prevResult;
        }

        var self = this;

        var qe = this.sparqlService.createQueryExecution(query);
        qe.setTimeout(this.timeoutInMillis);

        return qe.execSelect()
            .then(function(rs) {
                if (!rs) {
                    throw 'Null result set for query: ' + query;
                }

                // If result set size equals pageSize, request more data
                var result;
                if (!prevResult) {
                    result = rs;
                } else {
                    // Extract the arrays that backs the result set ...
                    var oldArr = prevResult.getIterator().getArray();
                    var newArr = rs.getIterator().getArray();

                    // ... and concatenate them
                    var nextArr = oldArr.concat(newArr);

                    //                    if(totalLimit) {
                    //                        nextArr.splice(0, totalLimit);
                    //                    }

                    var itBinding = new IteratorArray(nextArr);
                    result = new ResultSetArrayIteratorBinding(itBinding);
                }

                var rsSize = rs.getIterator().getArray().length;
                // console.debug('rsSize, PageSize: ', rsSize, self.pageSize);
                var pageSize = queryPaginator.getPageSize();

                // result size is empty or less than the pageSize or
                // limit reached
                if (rsSize === 0 || rsSize < pageSize) {
                    return result;
                } else {
                    return self.executeSelectRec(queryPaginator, result);
                }
            });
    },

    execSelect: function() {
        var clone = this.query.clone();
        var pageSize = this.pageSize || QueryExecutionPaginate.defaultPageSize;
        var paginator = new QueryPaginator(clone, pageSize);

        return Promise.method(this.executeSelectRec(paginator, null));
    },

    setTimeout: function(timeoutInMillis) {
        this.timeoutInMillis = timeoutInMillis;

        if (!this.timeoutMsgShown) {
            console.log('[WARN] Only preliminary timeout implementation for paginated query execution');
            this.timeoutMsgShown = true;
        }
    },
});

module.exports = QueryExecutionPaginate;
