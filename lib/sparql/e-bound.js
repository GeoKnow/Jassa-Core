var Class = require('../ext/class');
var newUnaryExpr = require('./new-unary-expr');

var E_Bound = Class.create({
    initialize: function(expr) {
        this.expr = expr;
    },

    copySubstitute: function(fnNodeMap) {
        return new E_Bound(fnNodeMap(this.expr));
    },

    getArgs: function() {
        return [this.expr];
    },

    copy: function(args) {
        var result = newUnaryExpr(E_Bound, args);
        return result;
    },

    toString: function() {
        return 'bound(' + this.expr + ')';
    }
});

module.exports = E_Bound;