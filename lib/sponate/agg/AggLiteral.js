var Class = require('../ext/Class');

var Agg = require('./Agg');
var AccLiteral = require('../accumulators/AccLiteral');

/**
 * An aggregator for a single valued field.
 *
 * Can carry a name to a client side aggregator to use.
 *
 *
 */
var AggLiteral = Class.create(Agg, {
    classLabel: 'jassa.sponate.PatternLiteral',

    initialize: function(expr, aggregatorName) {
        this.expr = expr;
        this.aggregatorName = aggregatorName;
    },

    getClassName: function() {
        return 'jassa.sponate.PatternLiteral';
    },

    createAcc: function() {
        var result = new AccLiteral(this);
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

module.exports = AggLiteral;
