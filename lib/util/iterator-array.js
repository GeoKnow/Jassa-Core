var IteratorObj = require('./iterator');

/**
 * Utility class to create an iterator over an array.
 *
 */
var IteratorArray = function(array, offset) {
    IteratorObj.call(this);

    this.initialize(array, offset);
};
// inherit
IteratorArray.prototype = Object.create(IteratorObj.prototype);
// hand back the constructor
IteratorArray.prototype.constructor = IteratorArray;

IteratorArray.prototype.initialize = function(array, offset) {
    this.array = array;
    this.offset = offset ? offset : 0;
};

IteratorArray.prototype.getArray = function() {
    return this.array;
};

IteratorArray.prototype.hasNext = function() {
    var result = this.offset < this.array.length;
    return result;
};

IteratorArray.prototype.next = function() {
    var hasNext = this.hasNext();

    var result;
    if (hasNext) {
        result = this.array[this.offset];

        ++this.offset;
    } else {
        result = null;
    }

    return result;
};

module.exports = IteratorArray;
