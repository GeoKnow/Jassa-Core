var Expr = require('./expr');

// TODO Change to ExprFunction1
var E_OneOf = function(lhsExpr, nodes) {
    Expr.call(this);

    this.initialize(lhsExpr, nodes);
};
// inherit
E_OneOf.prototype = Object.create(Expr.prototype);
// hand back the constructor
E_OneOf.prototype.constructor = E_OneOf;

// helper
var getSubstitute = function(node, fnNodeMap) {
    var result = fnNodeMap(node);
    if (!result) {
        result = node;
    }
    return result;
};

// TODO Jena uses an ExprList as the second argument
E_OneOf.prototype.initialize = function(lhsExpr, nodes) {

    this.lhsExpr = lhsExpr;
    //this.variable = variable;
    this.nodes = nodes;
};

E_OneOf.prototype.getVarsMentioned = function() {
    //return [this.variable];
    var result = this.lhsExpr.getVarsMentioned();
    return result;
};

E_OneOf.prototype.copySubstitute = function(fnNodeMap) {
    var newElements = this.nodes.map(function(x) {
        return getSubstitute(x, fnNodeMap);
    });
    return new E_OneOf(this.lhsExpr.copySubstitute(fnNodeMap), newElements);
};

E_OneOf.prototype.toString = function() {

    if (!this.nodes || this.nodes.length === 0) {
        // 
        return 'FALSE';
    } else {
        return '(' + this.lhsExpr + ' In (' + this.nodes.join(', ') + '))';
    }
};

module.exports = E_OneOf;