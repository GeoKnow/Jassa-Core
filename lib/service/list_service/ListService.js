var Class = require('../../ext/Class');

/**
 * A list service supports fetching ranges of items and supports thresholded counting.
 */
var ListService = Class.create({
    fetchItems: function(thing, limit, offset) {
        console.log('Not implemented');
        throw 'Not implemented';
    },

    fetchCount: function(thing, itemLimit, rowLimit) {
        console.log('Not implemented');
        throw 'Not implemented';
    },
});

module.exports = ListService;
