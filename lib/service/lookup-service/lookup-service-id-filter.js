var Class = require('../../ext/class');
var LookupServiceDelegateBase = require('./lookup-service-delegate-base');

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
        var newKeys = keys.filter(this.predicateFn);
        var result = this.delegate.lookup(newKeys);
        return result;
    },
});

module.exports = LookupServiceIdFilter;
