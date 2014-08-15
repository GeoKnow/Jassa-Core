var Class = require('../../ext/Class');
var ResultSet = require('./result-set');

/**
 * Utility class to create an iterator over an array.
 *
 */
var ResultSetArrayIteratorBinding = Class.create(ResultSet, {
    initialize: function(itBinding, varNames) {
        this.itBinding = itBinding;
        this.varNames = varNames;
    },

    hasNext: function() {
        return this.itBinding.hasNext();
    },

    next: function() {
        return this.nextBinding();
    },

    nextBinding: function() {
        return this.itBinding.next();
    },

    getVarNames: function() {
        return this.varNames;
    },

    getBindings: function() {
        return this.itBinding.getArray();
    },

    // Return the binding array
    getIterator: function() {
        // return this.itBinding.getArray();
        return this.itBinding;
    },
});

module.exports = ResultSetArrayIteratorBinding;
