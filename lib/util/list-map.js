var Class = require('../ext/class');
var HashMap = require('./hash-map');

/**
 * A map that retains insert order
 *
 */
var ListMap = Class.create({
    initialize: function(fnEquals, fnHash) {
        this.map = new HashMap(fnEquals, fnHash);
        this.keys = [];
    },

    put: function(key, value) {
        var v = this.map.get(key);
        if (v) {
            throw 'Key ' + v + ' already inserted';
        }

        this.keys.push(key);
        this.map.put(key, value);
    },

    get: function(key) {
        var result = this.map.get(key);
        return result;
    },

    getByIndex: function(index) {
        var key = this.keys[index];
        var result = this.map.get(key);
        return result;
    },

    entries: function() {
        var self = this;
        var result = this.keys.map(function(key) {
            var value = self.map.get(key);

            var r = {
                key: key,
                val: value
            };
            return r;
        });

        return result;
    },

    remove: function(key) {
        console.log(key);
        throw 'Implement me';
        /*
        var keys = this.keys;
        for(var i = 0; i < keys.length; ++i) {
            
        }
        
        this.map.remove(key);
        */
    },

    removeByIndex: function(index) {
        var key = this.keys[index];

        this.remove(key);
    },

    keyList: function() {
        return this.keys;
    },

    size: function() {
        return this.keys.length;
    },
});

module.exports = ListMap;