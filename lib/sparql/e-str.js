var ExprFunction1 = require('./expr-function-1');

var E_Str = function(subExpr) {
    ExprFunction1.call(this, 'str', subExpr);
};
// inherit
E_Str.prototype = Object.create(ExprFunction1.prototype);
// hand back the constructor
E_Str.prototype.constructor = E_Str;

E_Str.prototype.getVarsMentioned = function() {
    return this.subExpr.getVarsMentioned();
};

E_Str.prototype.copy = function(args) {
    return new E_Str(args[0]);
};

E_Str.prototype.toString = function() {
    return 'str(' + this.subExpr + ')';
};

module.exports = E_Str;
