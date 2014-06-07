(function() {
	
	var util = Jassa.vocab.util;
	var ns = Jassa.vocab.wgs84;
	
	var p = 'http://www.w3.org/2003/01/geo/wgs84_pos#';

	// String versions
	ns.str = {
		lon: p + "long",
		lat: p + "lat"
	};
		
	util.initNodes(ns);
	
})();