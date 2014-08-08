var Class = require('../../ext/class');
var LookupServiceBase = require('./lookup-service-base');
var HashMap = require('../../util/hash-map');
var Promise = require('bluebird');

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

        return new Promise(function(resolve) {
            resolve(map);
        });
    },
});

module.exports = LookupServiceConst;