var NodeFactory = require('../rdf/node-factory.js');
var p = 'http://www.w3.org/2001/XMLSchema#';

// String versions
var ns = {
    xboolean: NodeFactory.createUri(p + 'boolean'),
    xint: NodeFactory.createUri(p + 'int'),
    xinteger: NodeFactory.createUri(p + 'integer'),
    xlong: NodeFactory.createUri(p + 'long'),
    decimal: NodeFactory.createUri(p + 'decimal'),
    xfloat: NodeFactory.createUri(p + 'float'),
    xdouble: NodeFactory.createUri(p + 'double'),
    xstring: NodeFactory.createUri(p + 'string'),
    date: NodeFactory.createUri(p + 'date'),
    dateTime: NodeFactory.createUri(p + 'dateTime'),
};

module.exports = ns;
