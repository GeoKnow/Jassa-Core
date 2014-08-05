var DatatypeLabelInteger = require('./datatype/label-integer');
var DatatypeLabelFloat = require('./datatype/label-float');
var DatatypeLabelString = require('./datatype/label-string');

var DatatypeLabels = {
    xinteger: new DatatypeLabelInteger(),
    xfloat: new DatatypeLabelFloat(),
    xdouble: new DatatypeLabelFloat(),
    xstring: new DatatypeLabelString(),
    decimal: new DatatypeLabelFloat() // TODO Handle Decimal properly
};

// freeze
Object.freeze(DatatypeLabels);

module.exports = DatatypeLabels;