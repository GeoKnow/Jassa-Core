(function() {

	var util = Jassa.vocab.util;
	var ns = Jassa.vocab.rdfs;
	
	var p = 'http://www.w3.org/2000/01/rdf-schema#';
	
	ns.str = {
		label: p + 'label',
		subClassOf: p + 'subClassOf'
	};
	
	util.initNodes(ns);

})();	
