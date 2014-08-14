var Class = require('../ext/class');

var AggregatorBase = require('./AggregatorBase');
var AccumulatorMap = require('../accumulators/AccumulatorMap');

/**
 * An aggregator for a map from *variable* keys to patters
 *
 * map[keyExpr(binding)] = aggregator(binding);
 *
 * The subAggregator corresponds to the element contained
 *
 * TODO An array can be seen as a map from index to item
 * So formally, PatternMap is thus the best candidate for a map, yet
 * we should add a flag to treat this aggregator as an array, i.e. the groupKey as an index
 *
 */
var AggregatorMap = Class.create(AggregatorBase, {
    classLabel: 'jassa.sponate.AggregatorMap',

    initialize: function(keyExpr, subAggregator, isArray) {
        this.keyExpr = keyExpr;
        this.subAggregator = subAggregator;
        this._isArray = isArray;
    },

    getClassName: function() {
        return 'jassa.sponate.AggregatorMap';
    },

    getKeyExpr: function() {
        return this.keyExpr;
    },

    getSubAggregator: function() {
        return this.subAggregator;
    },

    isArray: function() {
        return this._isArray;
    },

    toString: function() {
        var result = '[' + this.subPattern + ' / ' + this.keyExpr + '/' + this.type + ']';
        return result;
    },

    createAccumulator: function() {
        var result = new AccumulatorMap(this);
        return result;
    },
//      accept: function(visitor) {
//          var result = this.callVisitor('visitMap', this, arguments);
//          return result;
//      },

    getVarsMentioned: function() {
        var result = this.subPattern.getVarsMentioned();
        return result;
    },

    getSubAggregators: function() {
        return [
            this.subAggregator,
        ];
    },

    $findPattern: function(attrPath, start) {
        var result = this.subPattern.findPattern(attrPath, start);
        return result;
    },

});

module.exports = AggregatorMap;
