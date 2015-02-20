var Class = require('../../ext/Class');
var Cache = require('./Cache');

var ObjectUtils = require('../../util/ObjectUtils');

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

    clear: function() {
        ObjectUtils.clear(this.data);
    }
});

module.exports = CacheSimple;
