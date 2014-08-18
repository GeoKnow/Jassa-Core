var Class = require('../../ext/Class');
var Expr = require('./Expr');

// TODO Should be ExprFunctionN
var E_Regex = Class.create(Expr, {
    initialize: function(expr, pattern, flags) {
        this.expr = expr;
        this.pattern = pattern;
        this.flags = flags;
    },

    copySubstitute: function(fnNodeMap) {
        return new E_Regex(this.expr.copySubstitute(fnNodeMap), this.pattern, this.flags);
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
        if (args.length !== 1) {
            throw 'Invalid argument';
        }

        var newExpr = args[0];
        var result = new E_Regex(newExpr, this.pattern, this.flags);
        return result;
    },

    toString: function() {
        var patternStr = this.pattern.replace('\"', '\\\"');
        var flagsStr = this.flags ? ', "' + this.flags.replace('\"', '\\\"') + '"' : '';

        return 'regex(' + this.expr + ', "' + patternStr + '"' + flagsStr + ')';
    },
});

module.exports = E_Regex;
