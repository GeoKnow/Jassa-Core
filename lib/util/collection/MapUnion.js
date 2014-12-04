var Class = require('../../ext/Class');

var HashSet = require('./HashSet');
var ArrayUtils = require('../ArrayUtils');

var MapUnion = Class.create({
    initialize: function(subMaps) {
        this.subMaps = subMaps;
    },

    get: function(key) {
        var map = ArrayUtils.find(this.subMaps, function(subMap) {
            var r = subMap.containsKey(key);
            return r;
        });

        var result = map ? map.get(key) : null;
        return result;
    },

    containsKey: function(key) {
        var result = this.subMaps.some(function(subMap) {
            var r = subMap.containsKey(key);
            return r;
        });

        return result;
    },

    entries: function() {
        var keys = new HashSet();

        var result = [];
        this.subMaps.forEach(function(subMap) {
            var subEntries = subMap.entries();

            subEntries.forEach(function(subEntry) {
                var k = subEntry.key;
                var alreadySeen = keys.contains(k);
                if(!alreadySeen) {
                    keys.add(k);
                    result.push(subEntry);
                }
            });
        });

        return result;
    }
});

module.exports = MapUnion;
