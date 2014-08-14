var Class = require('../ext/Class');
var NodeValue = require('./NodeValue');
var NodeFactory = require('../rdf/NodeFactory');
var AnonIdStr = require('../rdf/anon-id-str');
var xsd = require('../vocab/xsd');

var NodeValueNode = Class.create(NodeValue, {
    initialize: function(node) {
        this.node = node;

        this.nvNothing = NodeValue.makeNode(NodeFactory.createAnon(new AnonIdStr('node value nothing')));
    },

    asNode: function() {
        return this.node;
    },

    toString: function() {
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
    },
});

module.exports = NodeValueNode;
