var Class = require('../../ext/Class');
var Cache = require('./Cache');

/**
 * A simple cache that never forgets
 */
var CacheSimple = Class.create(Cache, {
    initialize: function(data) {
        this.data = data || {};
    },

    getItem: function(key) {
        var result = this.data[key];
        return result;
    },

    setItem: function(key, val) {
        this.data[key] = val;
    },

});

module.exports = CacheSimple;
