var Class = require('../../ext/Class');
var LookupServiceBase = require('./LookupServiceBase');

var HashMap = require('../../util/collection/HashMap');

var shared = require('../../util/shared');
var Promise = shared.Promise;


/**
 * Lookup Service which draws data from a function.
 * Keys will be omitted if undefined is returned.
 */
var LookupServiceFallback = Class.create(LookupServiceBase, {
    initialize: function(primaryLookupService, fallbackLookupService, acceptFn, resolveFn) {
        this.primaryLookupService = primaryLookupService;
        this.fallbackLookupService = fallbackLookupService;
        this.acceptFn = acceptFn || function(val, key) { return val != null; };
        this.resolveFn = resolveFn || function(fallback, primary, key) { return fallback; };
    },

    lookup: function(keys) {
        var self = this;

        var result = this.primaryLookupService.lookup(keys).then(function(m1) {

            var fallbackKeys = keys.filter(function(key) {
                var val = m1.get(key);
                var r = self.acceptFn(val, key);
                return r;
            });

            var r = self.fallbackLookupService.lookup(fallbackKeys).then(function(m2) {
                var r = new HashMap();

                r.putEntries(m1.entries());

                var entries = m2.entries();
                fallbackKeys.forEach(function(key) {
                    var primary = m1.get(key);
                    var fallback = m2.get(key);

                    var val = self.resolveFn(fallback, primary, key);

                    r.put(key, val);
                });

                return r;
            });

            return r;
        });

        return result;
    }

});

module.exports = LookupServiceFallback;
