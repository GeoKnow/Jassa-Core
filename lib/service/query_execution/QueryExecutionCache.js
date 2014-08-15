var Class = require('../../ext/Class');
var QueryExecution = require('./QueryExecution');
var IteratorArray = require('../../util/IteratorArray');
var ResultSetArrayIteratorBinding = require('../ResultSetArrayIteratorBinding');
var shared = require('../../util/shared');
var Promise = shared.Promise;

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

        this.createResultSetFromCacheData = function(cacheData) {
            var itBinding = new IteratorArray(cacheData.bindings);
            var varNames = cacheData.varNames;
            var rs = new ResultSetArrayIteratorBinding(itBinding, varNames);

            return rs;
        };
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

        var executionPromise = executionCache[cacheKey];

        if (!executionPromise) {
            // Check if there is an entry in the result cache
            var cacheData = resultCache.getItem(cacheKey);
            if (cacheData) {
                executionPromise = new Promise(function(resolve) {
                    resolve(cacheData);
                });
            } else {
                var request = this.queryExecution.execSelect();

                var trans = request.then(function(rs) {
                    var cacheData = {
                        bindings: rs.getBindings(),
                        varNames: rs.getVarNames(),
                    };

                    return cacheData;
                });

                var skipInsert = false;

                executionPromise = trans.then(function(cacheData) {
                    skipInsert = true;

                    delete executionCache[cacheKey];
                    resultCache.setItem(cacheKey, cacheData);

                    return cacheData;
                });

                if (!skipInsert) {
                    executionCache[cacheKey] = executionPromise;
                }
            }
        } else {
            // Note: Multiple query execution could happen from angular apply loops that execute too often
            // So this could indicate performance issues
            console.log('[INFO] Joined query execution for: ' + cacheKey);
        }

        var result = executionPromise.then(function(cacheData) {
            var rs = QueryExecutionCache.createResultSetFromCacheData(cacheData);
            return rs;
        });

        return result;
    },
});

module.exports = QueryExecutionCache;
