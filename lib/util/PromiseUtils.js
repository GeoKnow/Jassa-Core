var shared = require('./shared');
var Promise = shared.Promise;

var PromiseUtils = {

    createDeferred: function() {
        var resolve;
        var reject;

        var promise = new Promise(function() {
            resolve = arguments[0];
            reject = arguments[1];
        });

        return {
            resolve: resolve,
            reject: reject,
            promise: function() { return promise; },
            abort: promise.isCancellable && promise.isCancellable() ? promise.cancel : (promise.abort ? promise.abort() : null)
        };
    },

    defaultAbortFn: function(deferred) {
        deferred.abort();
    },

    defaultDeferredFn: function() {
        return this.createDeferred();
    },


    /**
     * Wraps a promise supplier function (i.e. a function returning a promise)
     * that delays between requests
     */
    postpone: function(promiseSupplierFn, ms, abortFn, deferredFactoryFn) {

        ms = ms == null ? 50 : ms;
        abortFn = abortFn || this.defaultAbortFn;
        deferredFactoryFn = deferredFactoryFn || this.defaultDeferredFn;

        return function() {
            var args = arguments;
            var deferred = deferredFactoryFn();
            var running = null;

            var timeout = setTimeout(function() {
                running = promiseSupplierFn.apply(this, args);
                running.then(function() {
                    deferred.resolve.apply(this, arguments);
                }).fail(function() {
                    deferred.reject.apply(this, arguments);
                });
            }, ms);

            var result = deferred.promise();
            result.abort = function() {
                if(running == null) {
                    clearTimeout(timeout);
                } else if(abortFn != null) {
                    abortFn(running);
                }
            };

            return result;
        };
    },

    /**
     * Returns a function returning a promise that wraps a function returning promises.
     * Only the resolution of the most recently created promise will be resolved.
     */
    lastRequest: function(promiseSupplierFn, abortFn, deferredFactoryFn) {
        var deferred = null;
        var prior = null;
        var counter = 0;

        abortFn = abortFn || this.defaultAbortFn;
        deferredFactoryFn = deferredFactoryFn || this.defaultDeferredFn;

        return function() {
            if(deferred == null) {
                deferred = deferredFactoryFn(); // jQuery.Deferred()
            }

            //var args = arguments;

            var now = ++counter;
            //console.log('now ' + now + ' for ', args);
            var next = promiseSupplierFn.apply(this, arguments);

            if(abortFn != null && prior != null) {
                abortFn(prior);
            }
            prior = next;

            next.then(function() {
                if(now === counter) {
                    //console.log('resolved' + now + ' for ', args);
                    deferred.resolve.apply(this, arguments);
                    deferred = null;
                }
            }, function() {
                if(now === counter) {
                    //console.log('rejected' + now + ' for ', args);
                    deferred.reject.apply(this, arguments);
                    deferred = null;
                }
            });


            return deferred.promise();
        };

    },
};

module.exports = PromiseUtils;
