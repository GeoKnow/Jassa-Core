var shared = require('./shared');
var Promise = shared.Promise;

var CacheUtils = {
    extractArgs: function(rawArgs) {
        var arr = Array.prototype.slice.call(rawArgs, 0);

        var result = arr.length > 1
            ? arr
            : arr[0]
            ;

        return result;
    },

    /**
     * Caches the execution of a promise based on a given key and keeps track of cancellations
     * for that key.
     *
     * @param keyToState A JS object that maps keys to states of running promises
     * @param key The key for which to obtain a promise
     * @param promiseSupplier A function that yields a promise
     */
    cacheExecution: function(keyToState, key, promiseSupplier) {

        var state = keyToState[key];

        if (state == null) {

            var skipInsert = false;

            var cleanupState = function() {
                skipInsert = true;
                delete keyToState[key];
            };

            var rawPromise = promiseSupplier();

            var promise =
                rawPromise
                    .then(function() {
                        cleanupState();

                        var r = CacheUtils.extractArgs(arguments);
                        return r;
                    }, function(e) {
                        cleanupState();

                        throw e;
                    })
                    ;

            state = {
                promise: promise,
                clients: {},
                nextId: 0 // next client id
            };

            if (!skipInsert) {
                keyToState[key] = state;
            }
        }

        // Create a new promise that will cancel the core promise
        // only if there are no more un-cancelled references
        var corePromise = state.promise;
        var clients = state.clients;
        var clientId = 'client_' + (state.nextId++);

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

        var result = new Promise(function(resolve, reject) {
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

        return result;
    },


    cacheResult: function(resultCache, key, promiseSupplier) {
        var result;
        var data = resultCache.getItem(key);
        if (data) {
            result = Promise.resolve(data);
        } else {
            result = promiseSupplier().then(function() {
                var data = CacheUtils.extractArgs(arguments);

                // TODO Potentially expect setItem to yield a promise which needs to be waited for
                resultCache.setItem(key, data);

                return data;
            });
        }

        return result;
    },

    /**
     * Combines execution cache and result cache
     */
    cacheExecutionAndResult: function(executionCache, resultCache, cacheKey, promiseSupplier) {
        // Check if there is an entry in the result cache
        var result = CacheUtils.cacheResult(resultCache, cacheKey, function() {
            var r = CacheUtils.cacheExecution(executionCache, cacheKey, function() {
                var s = promiseSupplier();

                return s;
            });

            return r;
        });

        return result;
    }
};


module.exports = CacheUtils;

