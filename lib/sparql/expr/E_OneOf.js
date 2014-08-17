var Class = require('../../ext/Class');
var Expr = require('./Expr');

// helper
var getSubstitute = function(node, fnNodeMap) {
    var result = fnNodeMap(node);
    if (!result) {
        result = node;
    }
    return result;
};

// TODO Change to ExprFunctionN
// TODO rhs should be exprList instead of nodes
var E_OneOf = Class.create(Expr, {
    // TODO Jena uses an ExprList as the second argument
    initialize: function(lhsExpr, nodes) {

        this.lhsExpr = lhsExpr;
        // this.variable = variable;
        this.nodes = nodes;
    },

    getVarsMentioned: function() {
        // return [this.variable];
        var result = this.lhsExpr.getVarsMentioned();
        return result;
    },

    copySubstitute: function(fnNodeMap) {
        var newElements = this.nodes.map(function(x) {
            return getSubstitute(x, fnNodeMap);
        });
        return new E_OneOf(this.lhsExpr.copySubstitute(fnNodeMap), newElements);
    },

    toString: function() {

        if (!this.nodes || this.nodes.length === 0) {
            //
            return 'FALSE';
        } else {
            return '(' + this.lhsExpr + ' in (' + this.nodes.join(', ') + '))';
        }
    },
});

module.exports = E_OneOf;
