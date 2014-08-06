var ExprFunction2 = require('./expr-function-2');
var newBinaryExpr = require('./new-binary-expr');

var E_LogicalOr = function(left, right) {
    ExprFunction2.call(this, '||', left, right);
};

// inherit
E_LogicalOr.prototype = Object.create(ExprFunction2.prototype);
// hand back the constructor
E_LogicalOr.prototype.constructor = E_LogicalOr;



E_LogicalOr.prototype.copySubstitute = function(fnNodeMap) {
    return new E_LogicalOr(this.left.copySubstitute(fnNodeMap), this.right.copySubstitute(fnNodeMap));
};

E_LogicalOr.prototype.getArgs = function() {
    return [this.left, this.right];
};

E_LogicalOr.prototype.copy = function(args) {
    return newBinaryExpr(E_LogicalOr, args);
};

E_LogicalOr.prototype.toString = function() {
    return '(' + this.left + ' || ' + this.right + ')';
};

module.exports = E_LogicalOr;