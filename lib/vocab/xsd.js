var Node_Uri = require('../rdf/node/uri');
var p = 'http://www.w3.org/2001/XMLSchema#';

// String versions
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
