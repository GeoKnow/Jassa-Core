var Class = require('../ext/Class');

/**
 * Datastructure for a map which retains order of inserts
 *
 */
var MapList = Class.create({
    initialize: function() {
        this.items = [];
        this.keyToIndex = {};
    },

    put: function(key, item) {
        if (key == null) {
            console.log('key must not be null');
            throw 'Bailing out';
        }

        var index = this.keyToIndex[key];
        if (index) {
            console.log('Index already existed');
            throw 'Bailing out';
        }

        index = this.items.length;
        this.items.push(item);

        this.keyToIndex[key] = index;
    },

    get: function(key) {
        var index = this.keyToIndex[key];

        var result = (index == null) ? null : this.items[index];

        return result;
    },

    getByIndex: function(index) {
        return this.items[index];
    },

    getItems: function() {
        return this.items;
    },

    getKeyToIndex: function() {
        return this.keyToIndex;
    },

//      asArray: function() {
//          return this.items.slice(0);
//      },
//
//      asMap: function() {
//
//      }
});

module.exports = MapList;
