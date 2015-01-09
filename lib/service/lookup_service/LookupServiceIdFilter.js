var Class = require('../../ext/Class');
var LookupServiceDelegateBase = require('./LookupServiceDelegateBase');

var HashMap = require('../../util/collection/HashMap');

/**
 * Lookup Service which can filter keys. Used to e.g. get rid of invalid URIs which would
 * cause SPARQL queries to fail
 */
var LookupServiceIdFilter = Class.create(LookupServiceDelegateBase, {
    initialize: function($super, delegate, predicateFn) {
        $super(delegate);
        this.predicateFn = predicateFn;
    },

    lookup: function(keys) {
        var self = this;
        var lookupKeys = [];
        var nullKeys = [];

        keys.each(function(key) {
            var isAccepted = self.predicateFn(key);
            if(isAccepted) {
                lookupKeys.push(key);
            } else {
                nullKeys.push(key);
            }
        });

        var result = this.delegate.lookup(lookupKeys).then(function(map) {
            var r = new HashMap();
            r.putEntries(map.entries());

            nullKeys.each(function(key) {
                r.put(key, null);
            });

            return r;
        });

        return result;
    },
});

module.exports = LookupServiceIdFilter;
