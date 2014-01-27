(function() {
	
	var util = Jassa.vocab.util;
	var ns = Jassa.vocab.owl;
	
	var p = 'http://www.w3.org/2002/07/owl#';
	
	ns.str = {
		'Class': p + 'Class',
		'DatatypeProperty': p + 'DatatypeProperty',
		'ObjectProperty': p + 'ObjectProperty',
		'AnnotationProperty': p + 'AnnotationProperty'
	};
	
	util.initNodes(ns);
	
})();	
