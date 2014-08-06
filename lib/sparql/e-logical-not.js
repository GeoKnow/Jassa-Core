var newBinaryExpr = require('./new-binary-expr');
var E_LogicalOr = require('./e-logical-or');

var E_LogicalNot = function(expr) {
    this.expr = expr;
};

E_LogicalNot.prototype = {
        copySubstitute: function(fnNodeMap) {
            return new E_LogicalNot(this.expr.copySubstitute(fnNodeMap));
        },

        getArgs: function() {
            return [this.left, this.right];
        },
        
        copy: function(args) {
            return newBinaryExpr(E_LogicalOr, args);
        },

        toString: function() {
            return '(!' + this.expr + ')';
        }
};

module.exports = E_LogicalNot;
