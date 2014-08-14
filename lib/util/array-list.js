var Class = require('../ext/Class');
var defaultEquals = require('./default-equals');

var ArrayList = Class.create({
    initialize: function(fnEquals) {
        this.items = [];
        this.fnEquals = fnEquals || defaultEquals;
    },

    setItems: function(items) {
        this.items = items;
    },

    getArray: function() {
        return this.items;
    },

    get: function(index) {
        var result = this.items[index];
        return result;
    },

    add: function(item) {
        this.items.push(item);
    },

    indexesOf: function(item) {
        var items = this.items;
        var fnEquals = this.fnEquals;

        var result = [];

        items.forEach(function(it, index) {
            var isEqual = fnEquals(item, it);
            if (isEqual) {
                result.push(index);
            }
        });

        return result;
    },

    contains: function(item) {
        var indexes = this.indexesOf(item);
        var result = indexes.length > 0;
        return result;
    },

    firstIndexOf: function(item) {
        var indexes = this.indexesOf(item);
        var result = (indexes.length > 0) ? indexes[0] : -1;
        return result;
    },

    lastIndexOf: function(item) {
        var indexes = this.indexesOf(item);
        var result = (indexes.length > 0) ? indexes[indexes.length - 1] : -1;
        return result;
    },

    /**
     * Removes the first occurrence of the item from the list
     */
    remove: function(item) {
        var index = this.firstIndexOf(item);
        if (index >= 0) {
            this.removeByIndex(index);
        }
    },

    removeByIndex: function(index) {
        this.items.splice(index, 1);
    },

    size: function() {
        return this.items.length;
    },
});

module.exports = ArrayList;
