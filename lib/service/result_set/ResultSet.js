var Class = require('../../ext/Class');
var IteratorObj = require('../../util/iterator');

/**
 * Utility class to create an iterator over an array.
 *
 */
var ResultSet = Class.create(IteratorObj, {
    getVarNames: function() {
        throw 'Override me';
    },
});

module.exports = ResultSet;
