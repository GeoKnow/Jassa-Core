var Class = require('../ext/class');
var IteratorObj = require('./iterator');

/**
 * Utility class to create an iterator over an array.
 *
 */
var IteratorArray = Class.create(IteratorObj, {
    initialize: function(array, offset) {
        this.array = array;
        this.offset = offset ? offset : 0;
    },

    getArray: function() {
        return this.array;
    },

    hasNext: function() {
        var result = this.offset < this.array.length;
        return result;
    },

    next: function() {
        var hasNext = this.hasNext();

        var result;
        if (hasNext) {
            result = this.array[this.offset];

            ++this.offset;
        } else {
            result = null;
        }

        return result;
    },
});

module.exports = IteratorArray;
