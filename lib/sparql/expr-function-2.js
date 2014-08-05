var ExprFunctionBase = require('./expr-function-base');

var ExprFunction2 = function(name, left, right) {
    ExprFunctionBase.call(this, name);

    // init
    this.initialize(left, right);
};

// inherit
ExprFunction2.prototype = Object.create(ExprFunctionBase.prototype);
// hand back the constructor
ExprFunction2.prototype.constructor = ExprFunction2;

ExprFunction2.prototype.initialize = function($super, left, right) {
    this.left = left;
    this.right = right;
};

ExprFunction2.prototype.getArgs = function() {
    return [this.left, this.right];
};

ExprFunction2.prototype.copy = function(args) {
    if (args.length !== 2) {
        throw 'Invalid argument';
    }

    var result = this.$copy(args[0], args[1]);
    return result;
};

ExprFunction2.prototype.getLeft = function() {
    return this.left;
};

ExprFunction2.prototype.getRight = function() {
    return this.right;
};

module.exports = ExprFunction2;
