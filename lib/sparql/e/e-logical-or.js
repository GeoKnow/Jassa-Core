var Class = require('../../ext/class');
var ExprFunction2 = require('../expr/expr-function-2');
var newBinaryExpr = require('../new-binary-expr');

var ELogicalOr = Class.create(ExprFunction2, {
    initialize: function($super, left, right) {
        $super('||', left, right);
    },

    copySubstitute: function(fnNodeMap) {
        return new ELogicalOr(this.left.copySubstitute(fnNodeMap), this.right.copySubstitute(fnNodeMap));
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
        return '(' + this.left + ' || ' + this.right + ')';
    },
});

module.exports = ELogicalOr;
