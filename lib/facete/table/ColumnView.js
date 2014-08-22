var Class = require('../../ext/Class');

/**
 * @param id Id of the column - string recommended; cannot be modified once set
 *
 */
var ColumnView = Class.create({
    initialize: function(tableMod, columnId) {
        this.tableMod = tableMod;
        this.columnId = columnId;
       /*
       this.sortCondition = sortCondition || new ns.SortCondition();
       this.aggregator = aggregator || null;
       this.filter = filter || null;
       */
    },

    getId: function() {
        return this.columnId;
    },

    getSortConditions: function() {
        var result = {};

        var id = this.columnId;

        this.tableMod.getSortConditions().forEach(function(sc) {
            var cid = sc.getColumnId();
            if(cid === id) {
                var sortType = sc.getSortType();

                result[sortType] = sc.getSortDir();
            }
        });

        return result;
    },

    getAggregator: function() {
        var result = this.tableMod.getAggregator(this.columnId);
        return result;
    },

    setAggregator: function(aggregator) {
        //this.tableMod.setAggregator(this.columnId, aggregator);
        this.tableMod.getAggregators()[this.columnId] = aggregator;
    }
});

module.exports = ColumnView;
