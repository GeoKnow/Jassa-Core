var NodeFactory = require('../rdf/node-factory.js');
var p = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';

var ns = {
    type: NodeFactory.createUri(p + 'type'),
    Property: NodeFactory.createUri(p + 'Property'),
};

module.exports = ns;
