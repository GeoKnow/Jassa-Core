var Class = require('../../ext/Class');
var ExprFunction2 = require('./ExprFunction2');
var ExprHelpers = require('../ExprHelpers');

var E_LogicalOr = Class.create(ExprFunction2, {
    initialize: function($super, left, right) {
        $super('||', left, right);
    },

    copySubstitute: function(fnNodeMap) {
        var a = this.left.copySubstitute(fnNodeMap);
        var b = this.right.copySubstitute(fnNodeMap);
        var result = new E_LogicalOr(a, b); 
        return result;
    },

    getArgs: function() {
        return [
            this.left,
            this.right,
        ];
    },

    copy: function(args) {
        return ExprHelpers.newBinaryExpr(E_LogicalOr, args);
    },

    toString: function() {
        return '(' + this.left + ' || ' + this.right + ')';
    },
});

module.exports = E_LogicalOr;
