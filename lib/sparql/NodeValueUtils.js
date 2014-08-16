var NodeFactory = require('../rdf/NodeFactory');
var NodeValue = require('./expr/NodeValue');
var NodeValueNode = require('./expr/NodeValueNode');
var AnonIdStr = require('../rdf/AnonIdStr');
var xsd = require('../vocab/xsd');

var NodeValueUtils = {
    nvNothing: new NodeValue(NodeFactory.createAnon(new AnonIdStr('node value nothing'))),

    createLiteral: function(val, typeUri) {
        var node = NodeFactory.createTypedLiteralFromValue(val, typeUri);
        var result = new NodeValueNode(node);
        return result;
    },

    makeString: function(str) {
        return NodeValueUtils.createLiteral(str, xsd.xstring.getUri());
    },

    makeInteger: function(val) {
        return NodeValueUtils.createLiteral(val, xsd.xint.getUri());
    },

    makeDecimal: function(val) {
        return NodeValueUtils.createLiteral(val, xsd.decimal.getUri());
    },

    makeFloat: function(val) {
        return NodeValueUtils.createLiteral(val, xsd.xfloat.getUri());
    },

    makeNode: function(node) {
        var result = new NodeValueNode(node);
        return result;
    },

};

module.exports = NodeValueUtils;
