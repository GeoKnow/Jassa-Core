var Class = require('../ext/Class');

/**
 * A map that just wraps a json object
 * Just there to provide a unified map interface
 */
var ObjectMap = Class.create({
    initialize: function(data) {
        this.data = data ? data : {};
    },

    get: function(key) {
        return this.data[key];
    },

    put: function(key, val) {
        this.data[key] = val;
    },

    remove: function(key) {
        delete this.data[key];
    },

    entries: function() {
        throw 'Not implemented';
    },

    toString: function() {
        return JSON.stringify(this.data);
    },
});

module.exports = ObjectMap;
