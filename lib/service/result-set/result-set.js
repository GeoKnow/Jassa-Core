var IteratorObj = require('../../util/iterator');

/**
 * Utility class to create an iterator over an array.
 *
 */
var ResultSet = function(array, offset) {
    IteratorObj.call(this);

    this.initialize(array, offset);
};
// inherit
ResultSet.prototype = Object.create(IteratorObj.prototype);
// hand back the constructor
ResultSet.prototype.constructor = ResultSet;

ResultSet.prototype.getVarNames = function() {
    throw 'Override me';
};

module.exports = ResultSet;
