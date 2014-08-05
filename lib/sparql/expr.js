/**
 * Expr classes, similar to those in Jena
 *
 * Usally, the three major cases we need to discriminate are:
 * - Varibles
 * - Constants
 * - Functions
 *
 */
var Expr = function() {};

Expr.prototype.isFunction = function() {
    return false;
};

Expr.prototype.isVar = function() {
    return false;
};

Expr.prototype.isConstant = function() {
    return false;
};

Expr.prototype.getFunction = function() {
    console.log('Override me');
    throw 'Override me';
};

Expr.prototype.getExprVar = function() {
    console.log('Override me');
    throw 'Override me';
};

Expr.prototype.getConstant = function() {
    console.log('Override me');
    throw 'Override me';
};

Expr.prototype.copySubstitute = function() {
    console.log('Override me');
    throw 'Override me';
};

Expr.prototype.copy = function() {
    console.log('Override me');
    throw 'Override me';
};

module.exports = Expr;