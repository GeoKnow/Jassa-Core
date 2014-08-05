var flatten = require('lodash.flatten');

/**
 * Note: this is a read only collection
 *
 */
var NestedList = function() {
    this.classLabel = 'jassa.util.NestedList';
};



NestedList.prototype.initialize = function() {
    this.subLists = [];
};

/**
 * Returns an array with the concatenation of all items
 */
NestedList.prototype.getArray = function() {
    // tmp is an array of arrays
    var tmp = this.subLists.forEach(function(subList) {
        return subList.getArray();
    });

    var result = flatten(tmp, true);

    return result;
};

NestedList.prototype.contains = function(item) {
    var found = this.subLists.find(function(subList) {
        var r = subList.contains(item);
        return r;
    });

    var result = !!found;
    return result;
};

module.exports = NestedList;