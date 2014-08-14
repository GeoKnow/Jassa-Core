var Class = require('../../ext/Class');
var newUnaryExpr = require('../new-unary-expr');

var ELike = Class.create({
    initialize: function(expr, pattern) {
        this.expr = expr;
        this.pattern = pattern;
    },

    copySubstitute: function(fnNodeMap) {
        return new ELike(this.expr.copySubstitute(fnNodeMap), this.pattern);
    },

    getVarsMentioned: function() {
        return this.expr.getVarsMentioned();
    },

    getArgs: function() {
        return [
            this.expr,
        ];
    },

    copy: function(args) {

        var result = newUnaryExpr(ELike, args);
        return result;
    },

    toString: function() {
        var patternStr = this.pattern.replace('\'', '\\\'');

        return '(' + this.expr + ' Like \'' + patternStr + '\')';
    },
});

module.exports = ELike;
