var Class = require('../../ext/Class');

var Agg = require('./Agg');
var AccLiteral = require('../acc/AccLiteral');

/**
 * An aggregator for a single valued field.
 *
 * Can carry a name to a client side aggregator to use.
 *
 *
 */
var AggLiteral = Class.create(Agg, {
    classLabel: 'jassa.sponate.AggLiteral',

    /**
     * @param {jassa.sparql.Expr} An expression to be evaluated
     * @param {function} An optional function applied on the eval'ed exprs
     */
    initialize: function(bindingMapper) {
        this.bindingMapper = bindingMapper;
    },

    clone: function() {
        var result = new AggLiteral(this.bindingMapper);
        return result;
    },

    getBindingMapper: function() {
        return this.bindingMapper;
    },

    getSubAggs: function() {
        return [];
    },

    createAcc: function() {
        var result = new AccLiteral(this.bindingMapper);
        return result;
    },

});

module.exports = AggLiteral;
