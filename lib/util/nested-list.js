var Class = require('../ext/class');
var flatten = require('lodash.flatten');

/**
 * Note: this is a read only collection
 *
 */
var NestedList = Class.create({
    classLabel: 'jassa.util.NestedList',
    initialize: function() {
        this.subLists = [];
    },

    /**
     * Returns an array with the concatenation of all items
     */
    getArray: function() {
        // tmp is an array of arrays
        var tmp = this.subLists.forEach(function(subList) {
            return subList.getArray();
        });

        var result = flatten(tmp, true);

        return result;
    },

    contains: function(item) {
        var found = this.subLists.find(function(subList) {
            var r = subList.contains(item);
            return r;
        });

        var result = Boolean(found);
        return result;
    },
});

module.exports = NestedList;
