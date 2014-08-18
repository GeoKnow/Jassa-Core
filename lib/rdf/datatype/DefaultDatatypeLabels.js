var DatatypeLabelInteger = require('./DatatypeLabelInteger');
var DatatypeLabelFloat = require('./DatatypeLabelFloat');
var DatatypeLabelString = require('./DatatypeLabelString');

var DefaultDatatypeLabels = {
    xinteger: new DatatypeLabelInteger(),
    xfloat: new DatatypeLabelFloat(),
    xdouble: new DatatypeLabelFloat(),
    xstring: new DatatypeLabelString(),
    decimal: new DatatypeLabelFloat(), // TODO Handle Decimal properly
};

// freeze
//Object.freeze(DatatypeLabels);

module.exports = DefaultDatatypeLabels;
