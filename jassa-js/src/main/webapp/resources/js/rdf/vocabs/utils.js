(function() {

	var rdf = Jassa.rdf;

	var ns = Jassa.rdf.vocabs.utils;

	/**
	 * Creates rdf.Node objects in the target namespace
	 * from strings in the source namepsace
	 * 
	 */
	ns.initNodes = function(target, source) {

		if(source == null) {
			source = target.str;
			
			if(source == null) {
				console.log('No source from where to init nodes');
				throw 'Bailing out';
			}
		}
		
		_.each(source, function(v, k) {
			target[k] = rdf.Node.uri(v);
		});
	};
	
})();	