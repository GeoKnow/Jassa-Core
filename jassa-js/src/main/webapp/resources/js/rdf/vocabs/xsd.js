(function() {
	
	var utils = Jassa.rdf.vocabs.utils;
	var ns = Jassa.rdf.vocabs.xsd;
	
	var p = 'http://www.w3.org/2001/XMLSchema#';

	// String versions
	ns.str = {
		xboolean: p + 'boolean',
		xint: p + 'int',
		xfloat: p + 'float',
		xdouble: p + 'double',
		xstring: p + 'string',
	
		date: p + 'date',
	    dateTime: p + 'dateTime'		
	};
	
	
	utils.initNodes(ns);

//	// Node versions
//	var str = ns.str;
//
//	_.each(ns.str, function(v, k) {
//		ns[k] = rdf.Node.uri(v);
//	});
	
//	_.extend(ns, {
//		xboolean: rdf.Node.uri(str.xboolean),
//		xint: rdf.Node.uri(str.xint),
//		xfloat: rdf.Node.uri(str.xfloat),
//		xdouble: rdf.Node.uri(str.xdouble),
//		xstring: rdf.Node.uri(str.xstring),
//	
//		date: rdf.Node.uri(str.date),
//	    dateTime: rdf.Node.uri(str.dateTime)
//	});

})();
