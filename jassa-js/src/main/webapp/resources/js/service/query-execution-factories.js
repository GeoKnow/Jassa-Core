(function($) {

	var ns = Jassa.service;
	
	
	ns.QueryExecutionFactory = Class.create({
		getServiceId: function() {
			throw "Not overridden";			
		},

		getStateHash: function() {
			throw "Not overridden";
		},
		
		createQueryExecution: function(queryStrOrObj) {
			throw "Not overridden";
		}
	});

	
	/**
	 * Base class for processing query strings.
	 */
	ns.QueryExecutionFactoryBaseString = Class.create(ns.QueryExecutionFactory, {
		createQueryExecution: function(queryStrOrObj) {
			var result;
			if(_(queryStrOrObj).isString()) {
				result = this.createQueryExecutionStr(queryStrOrObj);
			} else {
				result = this.createQueryExecutionObj(queryStrOrObj);
			}
			
			return result;
		},
		
		createQueryExecutionObj: function(queryObj) {
			var queryStr = "" + queryObj;
			var result = this.createQueryExecutionStr(queryStr);
			
			return result;
		},
		
		createQueryExecutionStr: function(queryStr) {
			throw "Not implemented";
		}
	});
	

	ns.QueryExecutionFactoryHttp = Class.create(ns.QueryExecutionFactoryBaseString, {
		initialize: function(serviceUri, defaultGraphUris, httpArgs) {
			this.serviceUri = serviceUri;
			this.setDefaultGraphs(defaultGraphUris);
			
			this.httpArgs = httpArgs;
		},

		getServiceId: function() {
			return this.serviceUri;
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
//			var idState = {
//					serviceUri: this.serviceUri,
//					defaultGraphUris: this.defaultGraphUris
//			}
//			
//			var result = JSON.stringify(idState);

			var result = JSON.strngify(this.defaultGraphUris);
			
			return result;
		},
			
		setDefaultGraphs: function(uriStrs) {
			this.defaultGraphUris = uriStrs ? uriStrs : [];
		},
	
		getDefaultGraphs: function() {
			return this.defaultGraphUris;
		},
		
		createQueryExecutionStr: function(queryStr) {
			var result = new ns.QueryExecutionHttp(queryStr, this.serviceUri, this.defaultGraphUris, this.httpArgs)
			return result;
		},
		
		createQueryExecutionObj: function($super, query) {
			if(true) {
				if(query.flatten) {
					var before = query;
					query = before.flatten();
					
					//console.log("FLATTEN BEFORE: " + before, before);
					//console.log("FLATTEN AFTER:"  + query, query);
				}
			}
			
			var result = $super(query);
			return result;
		}
	});
	
})(jQuery);