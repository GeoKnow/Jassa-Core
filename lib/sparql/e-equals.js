var ExprFunction2 = require('./expr-function-2');

var E_Equals = function(left, right) {
    ExprFunction2.call(this, '=', left, right);
};
// inherit
E_Equals.prototype = Object.create(ExprFunction2.prototype);
// hand back the constructor
E_Equals.prototype.constructor = E_Equals;



E_Equals.prototype.copySubstitute = function(fnNodeMap) {
    return new E_Equals(this.left.copySubstitute(fnNodeMap), this.right.copySubstitute(fnNodeMap));
};

E_Equals.prototype.copy = function(left, right) {
    return new E_Equals(left, right);
};

E_Equals.prototype.toString = function() {
    return '(' + this.left + ' = ' + this.right + ')';
};

/*E_Equals.prototype.eval = function(binding) {
    // TODO Evaluate the expression
};*/

module.exports = E_Equals;