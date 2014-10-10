var Class = require('../../ext/Class');

/**
 * A list service supports fetching ranges of items and supports thresholded counting.
 */
var ListService = Class.create({
    fetchItems: function(thing, limit, offset) {
        throw new Error('Not implemented');
    },

    fetchCount: function(thing, itemLimit, rowLimit) {
        throw new Error('Not implemented');
    },
});

module.exports = ListService;
