(function() {

	// This file requires the xsd datatypes, whereas xsd depends on rdf-core
	
	var xsd = Jassa.rdf.vocabs.xsd;
	var s = xsd.str;
	var ns = Jassa.rdf;
	
	
	ns.DatatypeLabels = {
		xinteger: new ns.DatatypeLabelInteger(),
		xfloat: new ns.DatatypeLabelFloat(),
		xstring: new ns.DatatypeLabelString()
	};
	
	
	ns.RdfDatatypes = {};
	
	ns.registerRdfDatype = function(uri, label) {
		ns.RdfDatatypes[uri] = new ns.RdfDatatype_Label(uri, label);
	};
	
	ns.registerRdfDatype(xsd.str.xint, ns.DatatypeLabels.xinteger);
	ns.registerRdfDatype(xsd.str.xstring, ns.DatatypeLabels.xstring);
	ns.registerRdfDatype(xsd.str.xfloat, ns.DatatypeLabels.xfloat);
	
	/**
	 * Some default datatypes.
	 * 
	 */
	
	var xsdps = ns.XsdParsers = {};
	
	xsdps[s.xboolean] = function(str) { return str == 'true'; };
	xsdps[s.xint] = function(str) { return parseInt(str, 10); };
	xsdps[s.xfloat] = function(str) { return parseFloat(str); };
	xsdps[s.xdouble] = function(str) { return parseFloat(str); };
	xsdps[s.xstring] = function(str) { return str; };
	
	
	// TODO Parse to some object other than string
	xsdps[s.date] = function(str) { return str; };
	xsdps[s.dateTime] = function(str) { return str; };

	
	
})();