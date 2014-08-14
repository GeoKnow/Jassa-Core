var Class = require('../ext/Class');

var Aggregator = require('./Aggregator');
var AccumulatorLiteral = require('../accumulators/AccumulatorLiteral');

/**
 * An aggregator for a single valued field.
 *
 * Can carry a name to a client side aggregator to use.
 *
 *
 */
var AggregatorLiteral = Class.create(Aggregator, {
    classLabel: 'jassa.sponate.PatternLiteral',

    initialize: function(expr, aggregatorName) {
        this.expr = expr;
        this.aggregatorName = aggregatorName;
    },

    getClassName: function() {
        return 'jassa.sponate.PatternLiteral';
    },

    createAccumulator: function() {
        var result = new AccumulatorLiteral(this);
        return result;
    },

    getExpr: function() {
        return this.expr;
    },

    toString: function() {
        return this.expr.toString();
    },

    getVarsMentioned: function() {
        var result = this.expr.getVarsMentioned();
        return result;
    },

    getSubPatterns: function() {
        return [];
    },
});

module.exports = AggregatorLiteral;
