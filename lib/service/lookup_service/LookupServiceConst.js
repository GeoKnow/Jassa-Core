var Class = require('../../ext/Class');
var LookupServiceBase = require('./LookupServiceBase');
var HashMap = require('../../util/collection/HashMap');
var shared = require('../../util/shared');
var Promise = shared.Promise;

var LookupServiceConst = Class.create(LookupServiceBase, {
    initialize: function(data) {
        this.data = data;
    },

    lookup: function(keys) {
        var map = new HashMap();
        var self = this;
        keys.forEach(function(key) {
            map.put(key, self.data);
        });

        var result = Promise.resolve(map);
        return result;
    },
});

module.exports = LookupServiceConst;
