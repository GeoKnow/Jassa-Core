var ExprFunctionN = require('./expr-function-n');

var E_Function = function(name, args) {
    ExprFunctionN.call(this, name, args);
};

// inherit
E_Function.prototype = Object.create(ExprFunctionN.prototype);
// hand back the constructor
E_Function.prototype.constructor = E_Function;

E_Function.prototype.copy = function(newArgs) {
    var result = new E_Function(this.name, newArgs);
    return result;
};

module.exports = E_Function;
