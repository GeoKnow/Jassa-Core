var Class = require('../../ext/Class');
var ExprHelpers = require('../ExprHelpers');

var E_Bound = Class.create({
    initialize: function(expr) {
        this.expr = expr;
    },

    copySubstitute: function(fnNodeMap) {
        return new E_Bound(fnNodeMap(this.expr));
    },

    getArgs: function() {
        return [
            this.expr,
        ];
    },

    copy: function(args) {
        var result = ExprHelpers.newUnaryExpr(E_Bound, args);
        return result;
    },

    toString: function() {
        return 'bound(' + this.expr + ')';
    },
});

module.exports = E_Bound;
