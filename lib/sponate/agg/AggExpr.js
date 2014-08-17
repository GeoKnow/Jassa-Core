var Class = require('../ext/Class');

var Agg = require('./Agg');
var AccExpr = require('../accumulators/AccExpr');

/**
 * An aggregator for a single valued field.
 *
 * Can carry a name to a client side aggregator to use.
 *
 *
 */
var AggExpr = Class.create(Agg, {
    classLabel: 'jassa.sponate.AggExpr',

    /**
     * @param {jassa.sparql.Expr} An expression to be evaluated
     * @param {function} An optional function applied on the eval'ed exprs
     */
    initialize: function(expr, fn) {
        this.expr = expr;
        this.fn = fn;
    },

    getExpr: function() {
        return this.expr;
    },

    getFn: function() {
        return this.fn;
    },

    getSubAggs: function() {
        return [];
    },

    createAcc: function() {
        var result = new AccExpr(this.Expr, this.fn);
        return result;
    },

    toString: function() {
        return this.expr.toString();
    },


});

module.exports = AggExpr;
