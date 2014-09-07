var NodeFactory = require('../rdf/NodeFactory');
var p = 'http://www.w3.org/2000/01/rdf-schema#';

var ns = {
    label: NodeFactory.createUri(p + 'label'),
    comment: NodeFactory.createUri(p + 'comment'),
    subClassOf: NodeFactory.createUri(p + 'subClassOf'),
};

module.exports = ns;
