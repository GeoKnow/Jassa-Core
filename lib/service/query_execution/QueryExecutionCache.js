var Class = require('../../ext/Class');
var QueryExecution = require('./QueryExecution');
var IteratorArray = require('../../util/collection/IteratorArray');
var ResultSetArrayIteratorBinding = require('../result_set/ResultSetArrayIteratorBinding');

var CacheUtils = require('../../util/CacheUtils');


/**
 * A query execution that does simple caching based on the query strings.
 *
 *
 */
var QueryExecutionCache = Class.create(QueryExecution, {
    initialize: function(queryExecution, cacheKey, requestCache) {
        this.queryExecution = queryExecution;

        this.cacheKey = cacheKey;
        this.requestCache = requestCache;

    },

    createResultSetFromCacheData: function(cacheData) {
        var itBinding = new IteratorArray(cacheData.bindings);
        var varNames = cacheData.varNames;
        var rs = new ResultSetArrayIteratorBinding(itBinding, varNames);

        return rs;
    },

    setTimeout: function(timeoutInMillis) {
        this.queryExecution.setTimeout(timeoutInMillis);
    },

    execSelect: function() {
        var cacheKey = this.cacheKey;

        var requestCache = this.requestCache;
        var resultCache = requestCache.getResultCache();
        var executionCache = requestCache.getExecutionCache();

        // Check the cache whether the same query is already running
        // Re-use its promise if this is the case

        // TODO Reusing promises must take timeouts into account

        // Check if there is an entry in the result cache
        var self = this;
        var executionPromise = CacheUtils.cacheExecutionAndResult(executionCache, resultCache, cacheKey, function() {
            var r = self.queryExecution.execSelect().then(function(rs) {

                var cacheData = {
                    bindings: rs.getBindings(),
                    varNames: rs.getVarNames(),
                };

                return cacheData;
            });

            return r;
        });

        var result = executionPromise.then(function(cacheData) {
            var rs = self.createResultSetFromCacheData(cacheData);
            //!!! return Promise.resolve(rs);
            return rs;
        });

        return result;
    },

});

module.exports = QueryExecutionCache;
