var shared = require('./shared');
var Promise = shared.Promise;

var PromiseUtils = {

    all: function(promises) {
        var r = Promise.all(promises)
            .cancellable()
            .catch(Promise.CancellationError, function(e) {
                promises.forEach(function(promise) {
                    try {
                        if(promise && promise.cancel) {
                            promise.cancel();
                        }
                    } catch(x) {
                        console.log('[ERROR] Cancelling a promise raised an exception');
                    }
                });

                throw e;
            });

        return r;
    },


    createDeferred: function(isCancellable) {
        var _resolve;
        var _reject;

        var promise = new Promise(function() {
            _resolve = arguments[0];
            _reject = arguments[1];
        });

        if(isCancellable) {
            promise.cancellable();
        }

        return {
            resolve: _resolve,
            reject: _reject,
            promise: function() { return promise; },
            isCancellable: function() {
                var r;

                if(promise.isCancellable) {
                    r = promise.isCancellable();
                } else if(promise.abort) {
                    r = true;
                }

                return r;
            },
            cancel: function() {
                if(promise.cancel) {
                    promise.cancel();
                } else if(promise.abort) {
                    promise.abort();
                }
            }
        };
    },

    defaultAbortFn: function(deferred) {
        deferred.cancel();
    },

    defaultDeferredFn: function() {
        return PromiseUtils.createDeferred(true);
    },


    /**
     * Wraps a promise supplier function (i.e. a function returning a promise)
     * that delays between requests
     */
    postpone: function(promiseSupplierFn, ms, abortFn, deferredFactoryFn) {

        ms = ms == null ? 50 : ms;
        abortFn = abortFn || this.defaultAbortFn;
        deferredFactoryFn = deferredFactoryFn || PromiseUtils.defaultDeferredFn;

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

        abortFn = abortFn || PromiseUtils.defaultAbortFn;
        deferredFactoryFn = deferredFactoryFn || PromiseUtils.defaultDeferredFn;

        return function() {
            if(deferred == null) {
                deferred = deferredFactoryFn(); // jQuery.Deferred()
            }

            this.deferred = deferred;

            //var args = arguments;

            var now = ++counter;
            //console.log('now ' + now + ' for ', args);
            var next = promiseSupplierFn.apply(this, arguments);

            if(abortFn != null && prior != null) {
                abortFn(prior);
            }
            prior = next;

            next.then(function() {
                if(now === counter && deferred) {
                    //console.log('resolved' + now + ' for ', args);
                    deferred.resolve.apply(this, arguments);
                    deferred = null;
                }
            }, function() {
                if(now === counter && deferred) {
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
