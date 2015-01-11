var Class = require('../../ext/Class');
var QueryExecution = require('./QueryExecution');
var IteratorArray = require('../../util/collection/IteratorArray');
var ResultSetArrayIteratorBinding = require('../result_set/ResultSetArrayIteratorBinding');
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
        //var self = this;

        var cacheKey = this.cacheKey;

        var requestCache = this.requestCache;
        var resultCache = requestCache.getResultCache();
        var executionCache = requestCache.getExecutionCache();

        // Check the cache whether the same query is already running
        // Re-use its promise if this is the case

        // TODO Reusing promises must take timeouts into account

        // Check if there is an entry in the result cache
        var executionPromise;
        var cacheData = resultCache.getItem(cacheKey);
        if (cacheData) {
            executionPromise = Promise.resolve(cacheData);
        } else {

            // The data is not cached yet, but a request for it might already be running
            var executionCacheEntry = executionCache[cacheKey];

            if (executionCacheEntry == null) {

                var skipInsert = false;

                var cleanupExecutionCache = function() {
                    skipInsert = true;
                    delete executionCache[cacheKey];
                };

                var promise =
                    this.queryExecution.execSelect()
                        .then(function(rs) {
                            cleanupExecutionCache();

                            var cacheData = {
                                bindings: rs.getBindings(),
                                varNames: rs.getVarNames(),
                            };

                            resultCache.setItem(cacheKey, cacheData);

                            return cacheData;
                        }, function(e) {
                            cleanupExecutionCache();

                            throw e;
                        })
                        ;


                /*
                var fetchResultSet = function() {
                    var r = self.queryExecution.execSelect().disposer(function() {
                        skipInsert = true;
                        delete executionCache[cacheKey];
                    });

                    return r;
                };

                var executionPromise =
                    Promise.using(fetchResultSet, function(rs) {
                         var cacheData = {
                             bindings: rs.getBindings(),
                             varNames: rs.getVarNames(),
                         };

                         resultCache.setItem(cacheKey, cacheData);

                         return cacheData;
                     });
                */

                executionCacheEntry = {
                    promise: promise,
                    clients: {},
                    nextId: 0
                };

                if (!skipInsert) {
                    executionCache[cacheKey] = executionCacheEntry;
                }
            }
//            else {
                // Note: Multiple query execution could happen from angular apply loops that execute too often
                // So this could indicate performance issues
                //console.log('[INFO] Joined query execution for: ' + cacheKey);
//            }

            // Now we need to register ourself as a client of the query execution


            // Create a new promise that will cancel the core promise
            // only if there are no more un-cancelled references
            var corePromise = executionCacheEntry.promise;
            var clients = executionCacheEntry.clients;
            var clientId = 'client_' + (executionCacheEntry.nextId++);

            clients[clientId] = true;

            var cleanupClient = function() {
                if(clientId != null) {
                    var isKnown = clients[clientId];

                    if(!isKnown) {
                        console.log('[ASSERTION ERROR] unknown client ' + clientId);
                    }

                    delete clients[clientId];
                }
            };

            executionPromise = new Promise(function(resolve, reject) {
                    corePromise.then(function(cacheData) {
                        cleanupClient();
                        resolve(cacheData);
                        //return cacheData;
                    }, function(e) {
                        cleanupClient();
                        reject(e);
                        //throw e;
                    });
                })
                .cancellable()
                .catch(function(e) {
                    cleanupClient();
                    clientId = null;

                    if(Object.keys(clients).length === 0) {
                        corePromise.cancel();
                    }

                    throw e;
                });
        }

        var self = this;
        var result = executionPromise.then(function(cacheData) {
            var rs = self.createResultSetFromCacheData(cacheData);
            //!!! return Promise.resolve(rs);
            return rs;
        });

        return result;
    },
});

module.exports = QueryExecutionCache;
