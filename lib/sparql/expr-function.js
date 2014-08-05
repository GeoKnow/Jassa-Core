var Expr = require('./expr');

var ExprFunction = function() {
    Expr.call(this);
};
// inherit
ExprFunction.prototype = Object.create(Expr.prototype);
// hand back the constructor
ExprFunction.prototype.constructor = ExprFunction;

ExprFunction.prototype.getName = function() {
    console.log('Implement me');
    throw 'Implement me';
};

ExprFunction.prototype.isFunction = function() {
    return true;
};

ExprFunction.prototype.getFunction = function() {
    return this;
};

module.exports = ExprFunction;