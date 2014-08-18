var p = 'http://www.w3.org/2001/XMLSchema#';
var Node_Uri = require('../rdf/node/Node_Uri');
// Note we can't use the NodeFactory here because of cyclic dep
// var NodeFactory = require('../rdf/NodeFactory');

var ns = {
    xboolean: new Node_Uri(p + 'boolean'),
    xint: new Node_Uri(p + 'int'),
    xinteger: new Node_Uri(p + 'integer'),
    xlong: new Node_Uri(p + 'long'),
    decimal: new Node_Uri(p + 'decimal'),
    xfloat: new Node_Uri(p + 'float'),
    xdouble: new Node_Uri(p + 'double'),
    xstring: new Node_Uri(p + 'string'),
    date: new Node_Uri(p + 'date'),
    dateTime: new Node_Uri(p + 'dateTime'),
};

module.exports = ns;
