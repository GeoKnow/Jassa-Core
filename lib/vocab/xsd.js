var NodeUri = require('../rdf/node/uri');
var p = 'http://www.w3.org/2001/XMLSchema#';

// String versions
var ns = {
    xboolean: new NodeUri(p + 'boolean'),
    xint: new NodeUri(p + 'int'),
    xinteger: new NodeUri(p + 'integer'),
    xlong: new NodeUri(p + 'long'),
    decimal: new NodeUri(p + 'decimal'),
    xfloat: new NodeUri(p + 'float'),
    xdouble: new NodeUri(p + 'double'),
    xstring: new NodeUri(p + 'string'),
    date: new NodeUri(p + 'date'),
    dateTime: new NodeUri(p + 'dateTime'),
};

module.exports = ns;
