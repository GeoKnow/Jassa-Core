var Class = require('../../ext/Class');
var newBinaryExpr = require('../new-binary-expr');
var ELogicalOr = require('./e-logical-or');

var ELogicalNot = Class.create({
    initialize: function(expr) {
        this.expr = expr;
    },

    copySubstitute: function(fnNodeMap) {
        return new ELogicalNot(this.expr.copySubstitute(fnNodeMap));
    },

    getArgs: function() {
        return [
            this.left,
            this.right,
        ];
    },

    copy: function(args) {
        return newBinaryExpr(ELogicalOr, args);
    },

    toString: function() {
        return '(!' + this.expr + ')';
    },
});

module.exports = ELogicalNot;
