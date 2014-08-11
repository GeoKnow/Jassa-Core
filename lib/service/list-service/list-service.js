var Class = require('../../ext/class');
/**
 * A list service supports fetching ranges of items and supports thresholded counting.
 */
var ListService = Class.create({
    fetchItems: function() { //thing, limit, offset) {
        console.log('Not implemented');
        throw 'Not implemented';
    },

    fetchCount: function() { //thing, threshold) {
        console.log('Not implemented');
        throw 'Not implemented';
    },
});

module.exports = ListService;
