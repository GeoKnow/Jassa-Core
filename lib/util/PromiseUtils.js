var shared = require('./shared');
var Promise = shared.Promise;

var ObjectUtils = require('./ObjectUtils');

var PromiseUtils = {

    /**
     * Set a new service as an attribute of an object, thereby cancelling
     * all prior requests
     */
    replaceService: function(obj, attr, newRawService) {

        var oldService = obj[attr];
        if(oldService && oldService.cancelAll) {
            oldService.cancelAll();
        }

        obj[attr] = newRawService != null ? PromiseUtils.lastRequestify(newRawService) : null;
    },

    /**
     * Takes an object and creates a new one where each method is wrapped
     * such that sucessive calls will cancel prior promises yeld by that method
     *
     * A cancelAll method to cancell all active requests is provided as well
     */
    lastRequestify: function(obj) {
        var result = {};

        var bind = function(val, obj) {
            var r = function() {
                var s = val.apply(obj, arguments);
                return s;
            };
            return r;
        };

        var fns = [];
        for(var key in obj) {
            var val = obj[key];

            if(ObjectUtils.isFunction(val)) {
                var fn = PromiseUtils.lastRequest(bind(val, obj));

                result[key] = fn;

                fns.push(fn);
            }
        }

        result.cancelAll = function() {
            fns.forEach(function(fn) {
                try {
                    if(fn.deferred) {
                        fn.deferred.cancel();
                    }
                } catch(e) {
                    console.log(e);
                }
            });
        };

        return result;
    },

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
        abortFn = abortFn || PromiseUtils.defaultAbortFn;
        deferredFactoryFn = deferredFactoryFn || PromiseUtils.defaultDeferredFn;

        var deferred = null;
        var r;
        var prior = null;
        var counter = 0;


        return function() {
            if(deferred == null) {
                deferred = deferredFactoryFn(); // jQuery.Deferred()

                r = deferred.promise();

                // Overwrite the deferred's 'promise's cancel method to cancel the underlying promise
                var originalCancelFn = r.cancel;
                r.cancel = function() {
                    if(originalCancelFn) {
                        originalCancelFn.call(r);
                    }

                    if(prior && deferred.isCancellable()) {
                        prior.cancel();
                    }
                };
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


            return r;
        };

    },

    /**
     * Does not request a further promise from the promise supplier as long
     * as a prior one is still running.
     */
    firstRequest: function(promiseSupplierFn, deferredFactoryFn) {
        var r = null;

        return function() {
            if(r == null) {
                var deferred = deferredFactoryFn(); // jQuery.Deferred()
                r = deferred.promise();

                var first = promiseSupplierFn.apply(this, arguments);

                // Overwrite the deferred's 'promise's cancel method to cancel the underlying promise
                var originalCancelFn = r.cancel;
                r.cancel = function() {
                    if(originalCancelFn) {
                        originalCancelFn.call(r);
                    }

                    if(first && deferred.isCancellable()) {
                        first.cancel();
                    }
                };


                first.then(function() {
                    if(deferred) {
                        deferred.resolve.apply(this, arguments);
                        r = null;
                    }
                }, function() {
                    if(deferred) {
                        deferred.reject.apply(this, arguments);
                        r = null;
                    }
                });
            }

            return r; //deferred.promise();
        };
    },
};

module.exports = PromiseUtils;
