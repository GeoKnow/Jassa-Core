var Datatype = require('./datatype');

var DatatypeLabels = {
    xinteger: new Datatype.LabelInteger(),
    xfloat: new Datatype.LabelFloat(),
    xdouble: new Datatype.LabelFloat(),
    xstring: new Datatype.LabelString(),
    decimal: new Datatype.LabelFloat() // TODO Handle Decimal properly
};

// freeze
Object.freeze(DatatypeLabels);

module.exports = DatatypeLabels;