var Class = require('../ext/class');
var Expr = require('./expr');
var xsd = require('../vocab/xsd');
var NodeFactory = require('../rdf/node-factory');
var NodeValueNode = require('./node-value-node');

// TODO Not sure about the best way to design this class
// Jena does it by subclassing for each type e.g. NodeValueDecimal

// TODO Do we even need this class? There is NodeValueNode now!

var NodeValue = Class.create(Expr, {
    initialize: function(node) {
        this.node = node;
    },

    isConstant: function() {
        return true;
    },

    getConstant: function() {
        return this;
    },

    getArgs: function() {
        return [];
    },

    getVarsMentioned: function() {
        return [];
    },

    asNode: function() {
        throw 'makeNode is not overridden';
    },

    copySubstitute: function() { // fnNodeMap) {
        // TODO Perform substitution based on the node value
        // But then we need to map a node to a nodeValue first...
        return this;
        // return new ns.NodeValue(this.node.copySubstitute(fnNodeMap));
    },

    toString: function() {
        var node = this.node;

        var result;
        if (node.isLiteral()) {
            if (node.getLiteralDatatypeUri() === xsd.xstring.getUri()) {
                result = '\'' + node.getLiteralLexicalForm() + '\'';
            } else if (node.dataType === xsd.xdouble.value) {
                // TODO This is a hack - why is it here???
                return parseFloat(this.node.value);
            }
        } else {
            result = node.toString();
        }
        // TODO Numeric values do not need the full rdf term representation
        // e.g. '50'^^xsd:double - this method should output 'natural/casual'
        // representations
        return result;
    },

    createLiteral: function(val, typeUri) {
        var node = NodeFactory.createTypedLiteralFromValue(val, typeUri);
        var result = new NodeValueNode(node);
        return result;
    },

    makeString: function(str) {
        return NodeValue.createLiteral(str, xsd.str.xstring);
    },

    makeInteger: function(val) {
        return new NodeValue.createLiteral(val, xsd.str.xint);
    },

    makeDecimal: function(val) {
        return new NodeValue.createLiteral(val, xsd.str.decimal);
    },

    makeFloat: function(val) {
        return new NodeValue.createLiteral(val, xsd.str.xfloat);
    },

    makeNode: function(node) {
        var result = new NodeValueNode(node);
        return result;
    },
});

module.exports = NodeValue;
