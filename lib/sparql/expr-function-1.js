var ExprFunctionBase = require('./expr-function-base');

var ExprFunction1 = function(name, subExpr) {
    ExprFunctionBase.call(this, name);

    this.subExpr = subExpr;
};
// inherit
ExprFunction1.prototype = Object.create(ExprFunctionBase.prototype);
// hand back the constructor
ExprFunction1.prototype.constructor = ExprFunction1;

ExprFunction1.prototype.getArgs = function() {
    return [this.subExpr];
};

ExprFunction1.prototype.copy = function(args) {
    if (args.length !== 1) {
        throw 'Invalid argument';
    }

    var result = this.$copy(args);
    return result;
};

ExprFunction1.prototype.getSubExpr = function() {
    return this.subExpr;
};

module.exports = ExprFunction1;