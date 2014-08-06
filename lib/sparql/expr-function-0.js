var ExprFunctionBase = require('./expr-function-base');

var ExprFunction0 = function(name) {
    ExprFunctionBase.call(this, name);
};
// inherit
ExprFunction0.prototype = Object.create(ExprFunctionBase.prototype);
// hand back the constructor
ExprFunction0.prototype.constructor = ExprFunction0;

ExprFunction0.prototype.getArgs = function() {
    return [];
};

ExprFunction0.prototype.copy = function(args) {
    if (args && args.length > 0) {
        throw 'Invalid argument';
    }

    var result = this.$copy(args);
    return result;
};

module.exports = ExprFunction0;