var Class = require('../../ext/Class');
var ExprFunction2 = require('./ExprFunction2');
var ExprUtils = require('../ExprUtils');

var E_LogicalOr = Class.create(ExprFunction2, {
    initialize: function($super, left, right) {
        $super('||', left, right);
    },

    copySubstitute: function(fnNodeMap) {
        return new E_LogicalOr(this.left.copySubstitute(fnNodeMap), this.right.copySubstitute(fnNodeMap));
    },

    getArgs: function() {
        return [
            this.left,
            this.right,
        ];
    },

    copy: function(args) {
        return ExprUtils.newBinaryExpr(E_LogicalOr, args);
    },

    toString: function() {
        return '(' + this.left + ' || ' + this.right + ')';
    },
});

module.exports = E_LogicalOr;
