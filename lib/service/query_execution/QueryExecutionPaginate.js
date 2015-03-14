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

    executeSelectRec: Promise.method(function(queryPaginator, prevResult) {
        var query = queryPaginator.next();
        //console.log('Query Pagination: ' + query);
        if (!query) {
            return prevResult;
        }

        var self = this;

        var qe = this.sparqlService.createQueryExecution(query);
        qe.setTimeout(this.timeoutInMillis);

        var result = qe.execSelect().then(function(rs) {
            if (!rs) {
                throw new Error('Null result set for query: ' + query);
            }

            // If result set size equals pageSize, request more data
            var r;
            if (!prevResult) {
                //!!! r = Promise.resolve(rs);
                r = rs;
            } else {
                // Extract the arrays that backs the result set ...
                var oldArr = prevResult.getIterator().getArray();
                var newArr = rs.getIterator().getArray();

                // ... and concatenate them
                var nextArr = oldArr.concat(newArr);
                //console.log('Concatting arrays to length ' + nextArr.length);

                //                    if(totalLimit) {
                //                        nextArr.splice(0, totalLimit);
                //                    }

                var itBinding = new IteratorArray(nextArr);
                //!!! r = Promise.resolve(new ResultSetArrayIteratorBinding(itBinding));
                r = new ResultSetArrayIteratorBinding(itBinding);
            }

            var rsSize = rs.getIterator().getArray().length;
            // console.debug('rsSize, PageSize: ', rsSize, self.pageSize);
            var pageSize = queryPaginator.getPageSize();

            // result size is empty or less than the pageSize or
            // limit reached
            var hasReachedEnd = rsSize === 0 || rsSize < pageSize;
            if (!hasReachedEnd) {
                r = self.executeSelectRec(queryPaginator, r);
            }

            return r;
        });

        return result;
    }),

    execSelect: function() {
        var clone = this.query.clone();
        var pageSize = this.pageSize || QueryExecutionPaginate.defaultPageSize;
        var paginator = new QueryPaginator(clone, pageSize);

        //return Promise.method(this.executeSelectRec(paginator, null));
        return this.executeSelectRec(paginator, null);
    },

    setTimeout: function(timeoutInMillis) {
        this.timeoutInMillis = timeoutInMillis;

        if (!QueryExecutionPaginate.timeoutMsgShown) {
            console.log('[WARN] Only preliminary timeout implementation for paginated query execution.');
            QueryExecutionPaginate.timeoutMsgShown = true;
        }
    },
});

module.exports = QueryExecutionPaginate;
