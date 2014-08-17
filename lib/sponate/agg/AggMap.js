var Class = require('../../ext/Class');

var AggBase = require('./Agg');
var AccMap = require('../acc/AccMap');

/**
 * An aggregator for a map from *variable* keys to patters
 *
 * map[keyExpr(binding)] = aggregator(binding);
 *
 * The subAgg corresponds to the element contained
 *
 * TODO An array can be seen as a map from index to item
 * So formally, PatternMap is thus the best candidate for a map, yet
 * we should add a flag to treat this aggregator as an array, i.e. the groupKey as an index
 *
 */
var AggMap = Class.create(AggBase, {
    classLabel: 'jassa.sponate.AggMap',

    initialize: function(fnBinding, subAgg) {
        this.fnBinding = fnBinding;
        this.subAgg = subAgg;
    },

    getFnBinding: function() {
        return this.fnBinding;
    },

    getSubAgg: function() {
        return this.subAgg;
    },

    getSubAggs: function() {
        return [
            this.subAgg,
        ];
    },

    createAcc: function() {
        var result = new AccMap(this.keyExpr, this.subAgg);
        return result;
    },

    toString: function() {
        var result = '[' + this.keyExpr + ' -> ' + this.subAgg + ']';
        return result;
    },

});

module.exports = AggMap;
