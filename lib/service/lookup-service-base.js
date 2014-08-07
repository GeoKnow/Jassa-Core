var LookupService = require('./lookup-service');

/**
 * This function must convert ids to unique strings
 * Only the actual service (e.g. sparql or rest) needs to implement it
 * Layers on top of it (e.g. caching, delaying) will then delegate to the
 * inner-most getIdStr function.
 *
 */
var LookupServiceBase = function() {
    LookupService.call(this);
};
// inherit
LookupServiceBase.prototype = Object.create(LookupService.prototype);
// hand back the constructor
LookupServiceBase.prototype.constructor = LookupServiceBase;

LookupServiceBase.prototype.getIdStr = function(id) {
    var result = '' + id;
    return result;
};

module.exports = LookupServiceBase;
