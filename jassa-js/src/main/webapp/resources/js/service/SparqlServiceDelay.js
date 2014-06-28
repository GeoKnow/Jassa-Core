(function() {

	var ns = Jassa.service;

	// The delay should actually wrap around the http request object.

	/**
	 * 
	 * SparqlServiceDelay 
	 */
	ns.SparqlServiceDelay = function(delegate, delay) {
		this.delegate = delegate;
    // FIXME: Scheduler not defined
		this.scheduler = new Scheduler(delay); 
	};
	
	ns.SparqlServiceDelay.prototype = {
		execSelect: function(queryString, callback) {
			return this.delegate.execSelect(queryString, callback);
		},
	
		execAsk: function(queryString, callback) {
			return this.delegate.execAsk(queryString, callback);
		}
	};

	
})();