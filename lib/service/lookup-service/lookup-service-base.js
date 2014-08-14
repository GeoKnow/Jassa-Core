var Class = require('../../ext/Class');
var LookupService = require('./lookup-service');

/**
 * This function must convert ids to unique strings
 * Only the actual service (e.g. sparql or rest) needs to implement it
 * Layers on top of it (e.g. caching, delaying) will then delegate to the
 * inner-most getIdStr function.
 *
 */
var LookupServiceBase = Class.create(LookupService, {
    getIdStr: function(id) {
        var result = id.toString();
        return result;
    },
});

module.exports = LookupServiceBase;
