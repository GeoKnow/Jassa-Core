var LookupServiceDelegateBase = require('./lookup-service-delegate-base');

/**
 * Lookup Service which can filter keys. Used to e.g. get rid of invalid URIs which would
 * cause SPARQL queries to fail
 */
var LookupServiceIdFilter = function(delegate, predicateFn) {
    LookupServiceDelegateBase.call(this, delegate);

    this.initialize(delegate, predicateFn);
};
// inherit
LookupServiceIdFilter.prototype = Object.create(LookupServiceDelegateBase.prototype);
// hand back the constructor
LookupServiceIdFilter.prototype.constructor = LookupServiceIdFilter;

LookupServiceIdFilter.prototype.initialize = function(delegate, predicateFn) {
    this.predicateFn = predicateFn;
};

LookupServiceIdFilter.prototype.lookup = function(keys) {
    var newKeys = keys.filter(this.predicateFn);
    var result = this.delegate.lookup(newKeys);
    return result;
};

module.exports = LookupServiceIdFilter;
