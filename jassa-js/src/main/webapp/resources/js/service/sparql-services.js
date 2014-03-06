(function($) {

	var ns = Jassa.service;

	
	ns.SparqlService = Class.create({
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
	ns.SparqlServiceBaseString = Class.create(ns.SparqlService, {
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
	

	ns.SparqlServiceHttp = Class.create(ns.SparqlServiceBaseString, {
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
		
		hashCode: function() {
		   return this.getServiceId() + '/' + this.getStateHash();
		},
		
		setDefaultGraphs: function(uriStrs) {
			this.defaultGraphUris = uriStrs ? uriStrs : [];
		},
	
		getDefaultGraphs: function() {
			return this.defaultGraphUris;
		},
		
		createQueryExecutionStr: function(queryStr) {
		    var ajaxOptions = _({}).defaults(this.ajaxOptions);
		    
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
	

    ns.RequestCache = Class.create({
        initialize: function(executionCache, resultCache) {
            this.executionCache = executionCache ? executionCache : {};
            this.resultCache = resultCache ? resultCache : new Cache();           
        },
  
        getExecutionCache: function() {
            return this.executionCache;
        },
  
        getResultCache: function() {
            return this.resultCache;
        }
    });


	/**
	 * Result Cache stores result sets - this is an instance of a class
	 * 
	 * Execution Cache holds all running queries' promises - this is just an associative array - i.e. {}
	 * Once the promises are resolved, the corresponding entries are removed from the execution cache
	 * 
	 * TODO Its not really a cache but more a registry
	 * 
	 */
	ns.SparqlServiceCache = Class.create(ns.SparqlServiceBaseString, {
	    
	    initialize: function(queryExecutionFactory, resultCache, executionCache) {
	        this.qef = queryExecutionFactory;
	        this.requestCache = new ns.RequestCache();
	        
	        /*
            this.executionCache = executionCache ? executionCache : {};
	        this.resultCache = resultCache ? resultCache : new Cache();
	        */
	    },
	    
	    getServiceId: function() {
	        return this.qef.getServiceId();
	    },
	    
	    getStateHash: function() {
	        return this.qef.getStateHash();
	    },
	    
	    hashCode: function() {
	        return 'cached:' + this.qef.hashCode();
	    },

	    createQueryExecutionStr: function(queryStr) {
	        var serviceId = this.qef.getServiceId();
	        var stateHash = this.qef.getStateHash();
	        
	        var cacheKey = serviceId + '-' + stateHash + queryStr;
	        
	        var qe = this.qef.createQueryExecution(queryStr);

	        var result = new ns.QueryExecutionCache(qe, cacheKey, this.requestCache);
	        
	        return result;
	    }

	});
	

    
	
})(jQuery);