var Class = require('../ext/Class');

var AggBase = require('./AggBase');
var AccMap = require('../accumulators/AccMap');

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

    initialize: function(keyExpr, subAgg, isArray) {
        this.keyExpr = keyExpr;
        this.subAgg = subAgg;
        this._isArray = isArray;
    },

    getClassName: function() {
        return 'jassa.sponate.AggMap';
    },

    getKeyExpr: function() {
        return this.keyExpr;
    },

    getSubAgg: function() {
        return this.subAgg;
    },

    isArray: function() {
        return this._isArray;
    },

    toString: function() {
        var result = '[' + this.subPattern + ' / ' + this.keyExpr + '/' + this.type + ']';
        return result;
    },

    createAcc: function() {
        var result = new AccMap(this);
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

    getSubAggs: function() {
        return [
            this.subAgg,
        ];
    },

    $findPattern: function(attrPath, start) {
        var result = this.subPattern.findPattern(attrPath, start);
        return result;
    },

});

module.exports = AggMap;
