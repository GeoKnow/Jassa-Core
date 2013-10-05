(function() {

	var ns = Jassa.sparql;

	/*
	 * rdf.Node is the same as sparql.Node, but the former is strongly preferred. 
	 * This alias for the Node object between the rdf and sparql namespace exists for legacy reasons.
	 */
	ns.Node = Jassa.rdf.Node;

})();