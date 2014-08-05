var ExprFunction2 = require('./expr-function-2');
var newBinaryExpr = require('./new-binary-expr');

var E_LessThan = function(left, right) {
    ExprFunction2.call(this, '<', left, right);
};

// inherit
E_LessThan.prototype = Object.create(ExprFunction2.prototype);
// hand back the constructor
E_LessThan.prototype.constructor = E_LessThan;


E_LessThan.prototype.copySubstitute = function(fnNodeMap) {
    return new E_LessThan(this.left.copySubstitute(fnNodeMap), this.right.copySubstitute(fnNodeMap));
};

E_LessThan.prototype.copy = function(args) {
    return newBinaryExpr(E_LessThan, args);
};

E_LessThan.prototype.toString = function() {
    return '(' + this.left + ' < ' + this.right + ')';
};

module.exports = E_LessThan;