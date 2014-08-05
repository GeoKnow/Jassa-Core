var xsd = require('../vocab/xsd');
var DatatypeLabels = require('./datatype-labels');
var RdfDatatype_Label = require('./rdf-datatype/label');

// init object
var RdfDatatypes = {};

// helper function
var registerRdfDatype = function(uri, label) {
    RdfDatatypes[uri] = new RdfDatatype_Label(uri, label);
};

registerRdfDatype(xsd.xint, DatatypeLabels.xinteger);
registerRdfDatype(xsd.xlong, DatatypeLabels.xinteger);
registerRdfDatype(xsd.xinteger, DatatypeLabels.xinteger);
registerRdfDatype(xsd.xstring, DatatypeLabels.xstring);
registerRdfDatype(xsd.xfloat, DatatypeLabels.xfloat);
registerRdfDatype(xsd.xdouble, DatatypeLabels.xdouble);
registerRdfDatype(xsd.decimal, DatatypeLabels.xfloat);