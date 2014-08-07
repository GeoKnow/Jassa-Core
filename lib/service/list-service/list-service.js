/**
 * A list service supports fetching ranges of items and supports thresholded counting.
 */
var ListService = function() {};

ListService.prototype.fetchItems = function() {//thing, limit, offset) {
    console.log('Not implemented');
    throw 'Not implemented';
};

ListService.prototype.fetchCount = function() { //thing, threshold) {
    console.log('Not implemented');
    throw 'Not implemented';
};

module.exports = ListService;
