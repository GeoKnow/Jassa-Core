/**
 * Sparql endpoint class.
 * Allows execution of sparql queries against a preconfigured service
 * 
 */			
(function($) {

	var sparql= Jassa.sparql;
	var util = Jassa.util;
	
	var ns = Jassa.service;

	
	/**
	 * SparqlServiceHttp
	 * 
	 * 
	 * @param serviceUri The HTTP service URL where to send the query to
	 * @param defaultGraphUris The RDF graphs on which to run the query by default
	 * @param httpArgs A JSON object with additional arguments to include in HTTP requests
	 */
	ns.SparqlServiceHttp = Class.create({
		initialize: function(serviceUri, defaultGraphUris, httpArgs) {
			this.serviceUri = serviceUri;
			this.setDefaultGraphs(defaultGraphUris);
			
			this.httpArgs = httpArgs;
		},

		/**
		 * This method is intended to be used by caches,
		 * 
		 * A service is not assumed to return the same result for
		 * a query if this method returned different hashes.   
		 * 
		 * 
		 */
		getStateHash: function() {
			var idState = {
					serviceUri: this.serviceUri,
					defaultGraphUris: this.defaultGraphUris
			}
			
			var result = JSON.stringify(idState);
			
			return result;
		},
			
		setDefaultGraphs: function(uriStrs) {
			this.defaultGraphUris = uriStrs ? uriStrs : [];
		},
	
		getDefaultGraphs: function() {
			return this.defaultGraphUris;
		},
	
		execAny: function(query, options) {
		
			//console.log("Preparing SPARQL query: " + query);
			
			// TODO Make this a switch
			if(true) {
				if(query.flatten) {
					var before = query;
					query = before.flatten();
					
					//console.log("FLATTEN BEFORE: " + before, before);
					//console.log("FLATTEN AFTER:"  + query, query);
				}
			}
		
		
			// Force the query into a string
			var queryString = "" + query;
			
			if(!queryString) {
				console.error("Empty queryString - should not happen");
			}
			
//			if(this.proxyServiceUri) {
//				httpOptions[this.proxyParamName] = serviceUri;
//				serviceUri = this.proxyServiceUri;
//			}
			
		
			var result = ns.execQuery(this.serviceUri, this.defaultGraphUris, queryString, this.httpArgs, options);

			return result;
		},
	

		/**
		 * 
		 * @returns {Promise<sparql.ResultSet>}
		 */
		execSelect: function(query, options) {
			var promise = this.execAny(query, options);
			var result = promise.pipe(ns.jsonToResultSet);
			return result;
		},
	
		execAsk: function(query, options) {
			return this.execAny(query, options).pipe(function(json) { return json['boolean']; });
		},

		// Returns an iterator of triples
		execConstructTriples: function(query, options) {
			return this.execAny(query, options);
		},
	
		execDescribeTriples: function(query, options) {
			return this.execAny(query, options);
		}
	});


	


})(jQuery);



