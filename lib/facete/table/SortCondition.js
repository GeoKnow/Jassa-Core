var Class = require('../../ext/Class');

/**
 *
 *
 * @param sortDir Sort direction; {=0: unspecified, >0: ascending, <0 descending}
 * @param nullDir Whether to sort null values first or last
 *
 * sortType: 'data' ordinary sort of the data , 'null' sort null values first or last
 *
 */
var SortCondition = Class.create({
    initialize: function(columnId, sortDir, sortType) {
        this.columnId = columnId;
        this.sortDir = sortDir == null ? 1 : sortDir;
        this.sortType = sortType || 'data';
    },

    getColumnId: function() {
        return this.columnId;
    },

    getSortType: function() {
        return this.sortType;
    },

    setSortType: function(sortType) {
        this.sortType = sortType;
    },

    getSortDir: function() {
        return this.sortDir;
    },

    setSortDir: function(sortDir) {
        this.sortDir = sortDir;
    }
});

module.exports = SortCondition;
