var Class = require('../../ext/Class');
var newUnaryExpr = require('../new-unary-expr');

var ELang = Class.create({
    initialize: function(expr) {
        this.expr = expr;
    },

    copySubstitute: function(fnNodeMap) {
        return new ELang(this.expr.copySubstitute(fnNodeMap));
    },

    getArgs: function() {
        return [
            this.expr,
        ];
    },

    copy: function(args) {
        var result = newUnaryExpr(ELang, args);
        return result;
    },

    toString: function() {
        return 'lang(' + this.expr + ')';
    },

    getVarsMentioned: function() {
        return this.expr.getVarsMentioned();
    },
});

module.exports = ELang;
