var Class = require('../../ext/Class');
var ExprHelpers = require('../ExprHelpers');

var E_IsIri = Class.create({
    initialize: function(expr) {
        this.expr = expr;
    },

    copySubstitute: function(fnNodeMap) {
        return new E_IsIri(this.expr.copySubstitute(fnNodeMap));
    },

    getArgs: function() {
        return [
            this.expr,
        ];
    },

    copy: function(args) {
        var result = ExprHelpers.newUnaryExpr(E_IsIri, args);
        return result;
    },

    toString: function() {
        return 'isIri(' + this.expr + ')';
    },

    getVarsMentioned: function() {
        return this.expr.getVarsMentioned();
    },
});

module.exports = E_IsIri;
