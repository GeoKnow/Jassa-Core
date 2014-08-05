var newBinaryExpr = require('./new-binary-expr');
var ExprFunction2 = require('./expr-function-2');

var E_LogicalAnd = function(left, right) {
    ExprFunction2.call(this, '&&', left, right);
};
// inherit
E_LogicalAnd.prototype = Object.create(ExprFunction2.prototype);
// hand back the constructor
E_LogicalAnd.prototype.constructor = E_LogicalAnd;

E_LogicalAnd.prototype.copySubstitute = function(fnNodeMap) {
    return new E_LogicalAnd(this.left.copySubstitute(fnNodeMap), this.right.copySubstitute(fnNodeMap));
};

E_LogicalAnd.prototype.copy = function(args) {
    return newBinaryExpr(E_LogicalAnd, args);
};

E_LogicalAnd.prototype.toString = function() {
    return '(' + this.left + ' && ' + this.right + ')';
};