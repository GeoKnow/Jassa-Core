var ResultSet = require('./result-set');

/**
 * Utility class to create an iterator over an array.
 *
 */
var ResultSetArrayIteratorBinding = function(itBinding, varNames) {
    ResultSet.call(this);

    this.initialize(itBinding, varNames);
};
// inherit
ResultSetArrayIteratorBinding.prototype = Object.create(ResultSet.prototype);
// hand back the constructor
ResultSetArrayIteratorBinding.prototype.constructor = ResultSetArrayIteratorBinding;

ResultSetArrayIteratorBinding.prototype.initialize = function(itBinding, varNames) {
    this.itBinding = itBinding;
    this.varNames = varNames;
};

ResultSetArrayIteratorBinding.prototype.hasNext = function() {
    return this.itBinding.hasNext();
};

ResultSetArrayIteratorBinding.prototype.next = function() {
    return this.nextBinding();
};

ResultSetArrayIteratorBinding.prototype.nextBinding = function() {
    return this.itBinding.next();
};

ResultSetArrayIteratorBinding.prototype.getVarNames = function() {
    return this.varNames;
};

ResultSetArrayIteratorBinding.prototype.getBindings = function() {
    return this.itBinding.getArray();
};

// Return the binding array
ResultSetArrayIteratorBinding.prototype.getIterator = function() {
    //return this.itBinding.getArray();
    return this.itBinding;
};

module.exports = ResultSetArrayIteratorBinding;
