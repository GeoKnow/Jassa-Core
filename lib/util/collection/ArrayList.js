var Class = require('../../ext/Class');
var ObjectUtils = require('../ObjectUtils');
var ArrayUtils = require('../ArrayUtils');

var ArrayList = Class.create({
    initialize: function(items, fnEquals) {
        this.items = items || [];
        this.fnEquals = fnEquals || ObjectUtils.isEqual;
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
        var result = ArrayUtils.indexesOf(this.items, item, this.fnEquals);
        return result;
    },

    contains: function(item) {
        var result = ArrayUtils.contains(this.items, item, this.fnEquals);
        return result;
    },

    firstIndexOf: function(item) {
        var result = ArrayUtils.firstIndexOf(this.items, item, this.fnEquals);
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
        ArrayUtils.removeItem(this.items, item, this.fnEquals);
    },

//    removeByIndex: function(index) {
//        this.items.splice(index, 1);
//    },

    size: function() {
        return this.items.length;
    }
});

module.exports = ArrayList;
