/**
 * Sparql endpoint class.
 * Allows execution of sparql queries against a preconfigured service
 * 
 */			
(function($) {

	var ns = Jassa.service;
	
	
	ns.QueryExecution = Class.create({
		execSelect: function() {
			throw "Not overridden";
		},
		
		execAsk: function() {
			throw "Not overridden";			
		},
		
		execDescribeTriples: function() {
			throw "Not overridden";
		},
		
		execConstructTriples: function() {
			throw "Not overridden";			
		},
		
		setTimeOut: function(timeSpanInMs) {
			throw "Not overridden";
		}
	});
	
	
	ns.QueryExecutionHttp = Class.create(ns.QueryExecution, {
		initialize: function(queryString, serviceUri, defaultGraphUris, httpArgs) {
			this.queryString = queryString;
			this.serviceUri = serviceUri;
			this.defaultGraphUris = defaultGraphUris;
			
			this.httpArgs = httpArgs;
		},
		
		/**
		 * 
		 * @returns {Promise<sparql.ResultSet>}
		 */
		execSelect: function() {
			var result = this.execAny(this.queryString).pipe(ns.jsonToResultSet);
			return result;
		},
	
		execAsk: function(query, options) {
			var result = this.execAny(query, options).pipe(function(json) {
				return json['boolean'];
			});
			
			return result;
		},

		// Returns an iterator of triples
		execConstructTriples: function() {
			return this.execAny(queryString);
		},
	
		execDescribeTriples: function() {
			return this.execAny(queryString);
		},
		
//		setTimeOut: function(timeSpanInMs) {
//			timeSpanInMs
//		},


		/**
		 * This method is intended to be used by caches,
		 * 
		 * A service is not assumed to return the same result for
		 * a query if this method returned different hashes.   
		 * 
		 * 
		 */
//		getStateHash: function() {
//			var idState = {
//					serviceUri: this.serviceUri,
//					defaultGraphUris: this.defaultGraphUris
//			}
//			
//			var result = JSON.stringify(idState);
//			
//			return result;
//		},
//			
//		setDefaultGraphs: function(uriStrs) {
//			this.defaultGraphUris = uriStrs ? uriStrs : [];
//		},
//	
//		getDefaultGraphs: function() {
//			return this.defaultGraphUris;
//		},
	
		execAny: function(queryString, options) {
		
			if(!queryString) {
				console.error("Empty queryString - should not happen");
			}
			
//			if(this.proxyServiceUri) {
//				httpOptions[this.proxyParamName] = serviceUri;
//				serviceUri = this.proxyServiceUri;
//			}
			
		
			var result = ns.execQuery(this.serviceUri, this.defaultGraphUris, queryString, this.httpArgs, options);

			return result;
		}
	});

})();
