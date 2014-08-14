var Class = require('../../ext/Class');
var newUnaryExpr = require('../new-unary-expr');

var EBound = Class.create({
    initialize: function(expr) {
        this.expr = expr;
    },

    copySubstitute: function(fnNodeMap) {
        return new EBound(fnNodeMap(this.expr));
    },

    getArgs: function() {
        return [
            this.expr,
        ];
    },

    copy: function(args) {
        var result = newUnaryExpr(EBound, args);
        return result;
    },

    toString: function() {
        return 'bound(' + this.expr + ')';
    },
});

module.exports = EBound;
