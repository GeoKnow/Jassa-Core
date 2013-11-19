(function() {

	var ns = Jassa.service;

	// The delay should actually wrap around the http request object.

	/**
	 * 
	 * SparqlServiceDelay 
	 */
	ns.SparqlServiceDelay = function(delegate, delay) {
		this.delegate = delegate;
		this.scheduler = new Scheduler(delay); 
	};
	
	ns.SparqlServiceDelay.prototype = {
		execSelect: function(queryString, callback) {
			return delegate.execSelect(queryString, callback);
		},
	
		execAsk: function(queryString, callback) {
			return delegate.execAsk(queryString, callback);
		}
	};

	
})();