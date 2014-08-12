var NodeFactory = require('../rdf/node-factory.js');
var p = 'http://www.w3.org/2002/07/owl#';

var ns = {
    Class: NodeFactory.createUri(p + 'Class'),
    DatatypeProperty: NodeFactory.createUri(p + 'DatatypeProperty'),
    ObjectProperty: NodeFactory.createUri(p + 'ObjectProperty'),
    AnnotationProperty: NodeFactory.createUri(p + 'AnnotationProperty'),
};

module.exports = ns;
