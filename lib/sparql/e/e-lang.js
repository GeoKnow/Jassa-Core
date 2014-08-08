var Class = require('../../ext/class');
var newUnaryExpr = require('../new-unary-expr');

var E_Lang = Class.create({
    initialize: function(expr) {
        this.expr = expr;
    },

    copySubstitute: function(fnNodeMap) {
        return new E_Lang(this.expr.copySubstitute(fnNodeMap));
    },

    getArgs: function() {
        return [this.expr];
    },

    copy: function(args) {
        var result = newUnaryExpr(E_Lang, args);
        return result;
    },

    toString: function() {
        return 'lang(' + this.expr + ')';
    },

    getVarsMentioned: function() {
        return this.expr.getVarsMentioned();
    }
});

module.exports = E_Lang;