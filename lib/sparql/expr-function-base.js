var PatternUtils = require('./pattern-utils');
var ExprFunction = require('./expr-function');

var ExprFunctionBase = function(name) {
    ExprFunction.call(this);

    // init
    this.initialize(name);
};
// inherit
ExprFunctionBase.prototype = Object.create(ExprFunction.prototype);
// hand back the constructor
ExprFunctionBase.prototype.constructor = ExprFunctionBase;


ExprFunctionBase.prototype.initialize = function(name) {
    this.name = name;
};

ExprFunctionBase.prototype.copySubstitute = function(fnNodeMap) {
    var args = this.getArgs();
    var newArgs = args.map(function(arg) {
        var r = arg.copySubstitute(fnNodeMap);
        return r;
    });

    var result = this.copy(newArgs);
    return result;
};

ExprFunctionBase.prototype.getVarsMentioned = function() {
    var result = PatternUtils.getVarsMentioned(this.getArgs());
    return result;
};

ExprFunctionBase.prototype.toString = function() {
    var result = this.name + '(' + this.getArgs().join(', ') + ')';
    return result;
};

module.exports = ExprFunctionBase;
