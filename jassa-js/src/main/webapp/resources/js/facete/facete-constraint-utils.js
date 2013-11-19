(function() {
	
	var sparql = Jassa.sparql;
	
	var ns = Jassa.facete;
	
	/**
	 * A class that - as the name states - combines triples and exprs.
	 *
	 * Additionally provides a createElements to turn its state into an array of sparql elements.
	 * 
	 */
	ns.TriplesAndExprs = Class.create({
		initialize: function(triples, exprs) {
			this.triples = triples;
			this.exprs = exprs;
		},
		
		getTriples: function() {
			return this.triples;
		},
		
		getExprs: function() {
			return this.exprs;
		},
		
		createElements: function() {
			var triples = this.triples;
			var exprs = this.exprs;

			var result = [];

			if(triples && triples.length > 0) {
				result.push(new sparql.ElementTriplesBlock(triples));
			}
			
			if(exprs && exprs.length > 0) {
				result.push(new sparql.ElementFilter(exprs))
				/*
				var filters = _(exprs).map(function(expr) {
					return new sparql.ElementFilter(expr);
				});
				*/
			}
			
			return result;
		}
	});
	
	
})();