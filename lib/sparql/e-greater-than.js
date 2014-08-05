var ExprFunction2 = require('./expr-function-2');
var newBinaryExpr = require('./new-binary-expr');

var E_GreaterThan = function(left, right) {
    ExprFunction2.call(this, '>', left, right);
};

// inherit
E_GreaterThan.prototype = Object.create(ExprFunction2.prototype);
// hand back the constructor
E_GreaterThan.prototype.constructor = E_GreaterThan;


E_GreaterThan.prototype.copySubstitute = function(fnNodeMap) {
    return new E_GreaterThan(this.left.copySubstitute(fnNodeMap), this.right.copySubstitute(fnNodeMap));
};

E_GreaterThan.prototype.copy = function(args) {
    return newBinaryExpr(E_GreaterThan, args);
};

E_GreaterThan.prototype.toString = function() {
    return '(' + this.left + ' > ' + this.right + ')';
};

module.exports = E_GreaterThan;

