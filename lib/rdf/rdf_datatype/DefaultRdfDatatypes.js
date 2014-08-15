var xsd = require('../../vocab/xsd');
var DatatypeLabels = require('../datatype/DefaultDatatypeLabels');
var RdfDatatypeLabel = require('./RdfDatatypeLabel');

// init object
var DefaultRdfDatatypes = {};

// helper function
var registerRdfDatype = function(uri, label) {
    DefaultRdfDatatypes[uri] = new RdfDatatypeLabel(uri, label);
};

registerRdfDatype(xsd.xint, DatatypeLabels.xinteger);
registerRdfDatype(xsd.xlong, DatatypeLabels.xinteger);
registerRdfDatype(xsd.xinteger, DatatypeLabels.xinteger);
registerRdfDatype(xsd.xstring, DatatypeLabels.xstring);
registerRdfDatype(xsd.xfloat, DatatypeLabels.xfloat);
registerRdfDatype(xsd.xdouble, DatatypeLabels.xdouble);
registerRdfDatype(xsd.decimal, DatatypeLabels.xfloat);

module.exports = DefaultRdfDatatypes;
