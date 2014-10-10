var Class = require('../../ext/Class');
var Expr = require('./Expr');

var ExprFunction = Class.create(Expr, {
    getName: function() {
        throw new Error('Implement me');
    },

    isFunction: function() {
        return true;
    },

    getFunction: function() {
        return this;
    },
});

module.exports = ExprFunction;
