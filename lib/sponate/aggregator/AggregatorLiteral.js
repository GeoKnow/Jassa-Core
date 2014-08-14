var Class = require('../ext/class');

var Aggregator = require('./Aggregator');
var AccumulatorMap = require('../accumulators/AccumulatorMap');

/**
 * An aggregator for a single valued field.
 *
 * Can carry a name to a client side aggregator to use.
 *
 *
 */
AggregatorLiteral = Class.create(Aggregator, {
    classLabel: 'jassa.sponate.PatternLiteral',

    initialize: function(expr, aggregatorName) {
        this.expr = expr;
        this.aggregatorName = aggregatorName;
    },

    getClassName: function() {
        return 'jassa.sponate.PatternLiteral';
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
