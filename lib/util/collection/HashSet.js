var Class = require('../../ext/Class');
var HashMap = require('./HashMap');

var HashSet = Class.create({
    initialize: function(fnEquals, fnHash) {
        this.map = new HashMap(fnEquals, fnHash);
    },

    add: function(item) {
        this.map.put(item, true);
    },

    contains: function(item) {
        var result = this.map.containsKey(item);
        return result;
    },

    remove: function(item) {
        this.map.remove(item);
    },

    entries: function() {
        var result = this.map.entries().map(function(entry) {
            // return entry.getKey();
            return entry.key;
        });

        return result;
    },

    toString: function() {
        var entries = this.entries();
        var result = '{' + entries.join(', ') + '}';
        return result;
    },
});

module.exports = HashSet;
