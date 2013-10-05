(function() {
	
	var utils = Jassa.rdf.vocabs.utils;
	var ns = Jassa.rdf.vocabs.wgs84;
	
	var p = 'http://www.w3.org/2003/01/geo/wgs84_pos#';

	// String versions
	ns.str = {
		lon: p + "long",
		lat: p + "lat",
	};
		
	utils.initNodes(ns);
	
})();