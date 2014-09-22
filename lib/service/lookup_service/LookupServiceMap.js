var Class = require('../../ext/Class');
var LookupServiceBase = require('./LookupServiceBase');

var HashMap = require('../../util/collection/HashMap');

var shared = require('../../util/shared');
var Promise = shared.Promise;


/**
 * Lookup Service which draws data from a map object.
 */
var LookupServiceMap = Class.create(LookupServiceBase, {
    initialize: function(map) {
        this.map = map;
    },

    lookup: Promise.method(function(keys) {
        var result = new HashMap();

        var self = this;
        keys.forEach(function(key) {
            var val = self.map.get(key);
            result.put(key, val);
        });

        return result;
    }),

});

module.exports = LookupServiceMap;
