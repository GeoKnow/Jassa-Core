var ExprFunctionBase = require('./expr-function-base');

var ExprFunctionN = function(name, args) {
    ExprFunctionBase.call(this, name, args);

    this.args = args;
};

// inherit
ExprFunctionN.prototype = Object.create(ExprFunctionBase.prototype);
// hand back the constructor
ExprFunctionN.prototype.constructor = ExprFunctionN;

ExprFunctionN.prototype.getArgs = function() {
    return this.args;
};

module.exports = ExprFunctionN;
