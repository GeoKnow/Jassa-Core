var Class = require('../../ext/Class');
var ExprHelpers = require('../ExprHelpers');

var E_Like = Class.create({
    initialize: function(expr, pattern) {
        this.expr = expr;
        this.pattern = pattern;
    },

    copySubstitute: function(fnNodeMap) {
        return new E_Like(this.expr.copySubstitute(fnNodeMap), this.pattern);
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

        var result = ExprHelpers.newUnaryExpr(E_Like, args);
        return result;
    },

    toString: function() {
        var patternStr = this.pattern.replace('\'', '\\\'');

        return '(' + this.expr + ' Like \'' + patternStr + '\')';
    },
});

module.exports = E_Like;
