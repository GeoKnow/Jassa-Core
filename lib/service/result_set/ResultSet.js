var Class = require('../../ext/Class');
var Iterator = require('../../util/collection/Iterator');

/**
 * Utility class to create an iterator over an array.
 *
 */
var ResultSet = Class.create(Iterator, {
    getVarNames: function() {
        throw new Error('Override me');
    },
});

module.exports = ResultSet;
