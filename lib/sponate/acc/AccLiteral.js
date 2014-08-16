var Class = require('../ext/Class');

var TypedValue = require('../../rdf/TypeValue');
var NodeValue = require('../../sparql/NodeValue');

var Acc = require('./Acc');

var nodeToString = function(node) {
    var result;

    if (node.isUri()) {
        result = node.toString();
    } else if (node.isLiteral()) {
        result = node.getLiteralValue();

        if (result instanceof TypedValue) {
            result = result.getLexicalValue();
        }

    } else if (NodeValue.nvNothing.asNode().equals(node)) {
        result = null;
    } else {
        console.log('[ERROR] Unsupported node types: ', node);
        throw 'Unsupported node type';
    }

    return result;
};

var AccLiteral = Class.create(Acc, {
    classLabel: 'jassa.sponate.AccLiteral',

    initialize: function(aggregatorLiteral) {
        this.aggregatorLiteral = aggregatorLiteral;

        this.node = null;
    },

    getAgg: function() {
        return this.aggregatorLiteral;
    },

    process: function(binding, context) {
        var expr = this.aggregatorLiteral.getExpr();

        var exprEvaluator = context.exprEvaluator;

        var ex = exprEvaluator.eval(expr, binding);
        if (ex.isConstant()) {
            var c = ex.getConstant();
            var node = c.asNode();

            this.setNode(node);

        } else {
            console.log('[ERROR] Could not evaluate to constant');
            throw 'Bailing out';
        }
    },

    setNode: function(newNode) {
        var oldNode = this.node;

        if (oldNode == null) {
            this.node = newNode;
        } else {
            if (!oldNode.equals(newNode)) {
                console.log('[ERROR] Value already set: Attempted to override ' + oldNode + ' with ' + newNode);
            }
        }
    },

    getJson: function(retainRdfNodes) {
        var result;

        var node = this.node;

        if (node) {

            if (retainRdfNodes) {
                result = node;
            } else {
                result = nodeToString(node);
            }
        }

        return result;
    },

});

module.exports = AccLiteral;
