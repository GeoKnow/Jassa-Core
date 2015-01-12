var Class = require('../../ext/Class');

var HashSet = require('./HashSet');
var ArrayUtils = require('../ArrayUtils');

var MapUnion = Class.create({
    initialize: function(subMaps) {
        this.subMaps = subMaps;
    },

    /**
     * @param key A key that is looked up in the union of all sub-hash maps
     * @returns {*} the first value object that matches the given key where the
     *      sub-hash maps are searched in the order they were given in the
     *      constructor call
     */
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

    /**
     * @returns {Array} An array holding the value objects for all keys of the
     *      map union; NOTE that in case two hash maps have the same key, but
     *      different values, only the first value is returned, so the number
     *      of values matches the number of distinct keys; 'first here refers
     *      to the order the sub-hash maps were givin in the map union
     *      constructor
     */
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
