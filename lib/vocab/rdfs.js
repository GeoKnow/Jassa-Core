var NodeFactory = require('../rdf/node-factory.js');
var p = 'http://www.w3.org/2000/01/rdf-schema#';

var ns = {
    label: NodeFactory.createUri(p + 'label'),
    subClassOf: NodeFactory.createUri(p + 'subClassOf'),
};

module.exports = ns;
