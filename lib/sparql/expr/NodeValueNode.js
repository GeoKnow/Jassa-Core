var Class = require('../../ext/Class');
var xsd = require('../../vocab/xsd');
var NodeValue = require('./NodeValue');

var NodeValueNode = Class.create(NodeValue, {
    initialize: function(node) {
        this.node = node;
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

        if (result == null) {
            result = node.toString();
        }

        return result;
    },
});

//NodeValueNode.nvNothing = new NodeValue(NodeFactory.createAnon(new AnonIdStr('node value nothing')));

module.exports = NodeValueNode;
