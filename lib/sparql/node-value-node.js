var NodeValue = require('./node-value');
var NodeFactory = require('../rdf/node-factory');
var AnonIdStr = require('../rdf/anon-id-str');
var xsd = require('../vocab/xsd');

var NodeValueNode = function(node) {
    NodeValue.call(this);

    this.initialize(node);

    this.nvNothing = NodeValue.makeNode(NodeFactory.createAnon(new AnonIdStr('node value nothing')));
};
// inherit
NodeValueNode.prototype = Object.create(NodeValue.prototype);
// hand back the constructor
NodeValueNode.prototype.constructor = NodeValueNode;

NodeValueNode.prototype.initialize = function(node) {
    this.node = node;
};

NodeValueNode.prototype.asNode = function() {
    return this.node;
};

NodeValueNode.prototype.toString = function() {
    var node = this.node;

    var result = null;
    if (node.isLiteral()) {
        if (node.getLiteralDatatypeUri() === xsd.xstring.getUri()) {
            result = '"' + node.getLiteralLexicalForm() + '"';
        }
    }

    if (result === null) {
        result = node.toString();
    }

    return result;
};
