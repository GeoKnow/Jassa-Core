(function() {

	var utils = Jassa.rdf.vocabs.utils;
	var ns = Jassa.rdf.vocabs.rdfs;
	
	var p = 'http://www.w3.org/2000/01/rdf-schema#';
	
	ns.str = {
		label: p + 'label',
		subClassOf: p + 'subClassOf'
	};
	
	utils.initNodes(ns);

})();	
