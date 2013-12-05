(function($) {

	var ns = Jassa.service;
	
	
	ns.QueryExecutionFactory = Class.create({
		getServiceId: function() {
		    console.log('[ERROR] Method not overridden');
			throw '[ERROR] Method not overridden';
		},

		getStateHash: function() {
            console.log('[ERROR] Method not overridden');
            throw '[ERROR] Method not overridden';
		},
		
		createQueryExecution: function(queryStrOrObj) {
            console.log('[ERROR] Method not overridden');
            throw '[ERROR] Method not overridden';
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
		initialize: function(serviceUri, defaultGraphUris, ajaxOptions, httpArgs) {
			this.serviceUri = serviceUri;
			this.setDefaultGraphs(defaultGraphUris);
			
            this.ajaxOptions = ajaxOptions;
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
		 * The state hash does not include the serviceId
		 * 
		 */
		getStateHash: function() {
//			var idState = {
//					serviceUri: this.serviceUri,
//					defaultGraphUris: this.defaultGraphUris
//			}
//			
//			var result = JSON.stringify(idState);

			var result = JSON.stringify(this.defaultGraphUris);
			
			return result;
		},
			
		setDefaultGraphs: function(uriStrs) {
			this.defaultGraphUris = uriStrs ? uriStrs : [];
		},
	
		getDefaultGraphs: function() {
			return this.defaultGraphUris;
		},
		
		createQueryExecutionStr: function(queryStr) {
		    var ajaxOptions = _({}).extend(this.ajaxOptions);
		    
			var result = new ns.QueryExecutionHttp(queryStr, this.serviceUri, this.defaultGraphUris, ajaxOptions, this.httpArgs);
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
	

    
//    ns.CacheQuery = Class.create({
//        
//    });
//
	
	/**
	 * Result Cache stores result sets - this is an instance of a class
	 * 
	 * Execution Cache holds all running queries this is just an associative array - i.e. {}
	 * 
	 */
	ns.QueryExecutionFactoryCache = Class.create(ns.QueryExecutionFactoryBaseString, {
	    
	    initialize: function(queryExecutionFactory, resultCache, executionCache) {
	        this.qef = queryExecutionFactory;
            this.executionCache = executionCache ? executionCache : {};
	        this.resultCache = resultCache ? resultCache : new Cache();
	    },
	    
	    createQueryExecutionStr: function(queryStr) {
	        var serviceId = this.qef.getServiceId();
	        var stateHash = this.qef.getStateHash();
	        
	        var cacheKey = serviceId + '-' + stateHash + queryStr;
	        
	        var qe = this.qef.createQueryExecution(queryStr);

	        var result = new ns.QueryExecutionCache(qe, cacheKey, this.executionCache, this.resultCache);
	        
	        return result;
	    }

	});
	

    
    
	
})(jQuery);