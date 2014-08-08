var Class = require('../ext/class');
var newBinaryExpr = require('./new-binary-expr');
var ExprFunction2 = require('./expr-function-2');

var E_LogicalAnd = Class.create(ExprFunction2, {
    initialize: function($super, left, right) {
        $super('&&', left, right);
    },

    copySubstitute: function(fnNodeMap) {
        return new E_LogicalAnd(this.left.copySubstitute(fnNodeMap), this.right.copySubstitute(fnNodeMap));
    },

    copy: function(args) {
        return newBinaryExpr(E_LogicalAnd, args);
    },

    toString: function() {
        return '(' + this.left + ' && ' + this.right + ')';
    },
});

module.exports = E_LogicalAnd;
