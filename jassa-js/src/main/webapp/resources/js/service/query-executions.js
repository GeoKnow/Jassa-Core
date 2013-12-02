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
			
            this.ajaxOptions = {};
			//this.timeoutInMillis = null;
		},
		
		/**
		 * 
		 * @returns {Promise<sparql.ResultSet>}
		 */
		execSelect: function() {
			var result = this.execAny().pipe(ns.jsonToResultSet);
			return result;
		},
	
		execAsk: function() {
			var result = this.execAny().pipe(function(json) {
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
		
		setTimeout: function(timeoutInMillis) {
			this.ajaxOptions.timeout = timeoutInMillis;
		},
		
		getTimeout: function() {
		    return this.ajaxOptions.timeout;
		},


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
	
		execAny: function() {
			
//			if(this.proxyServiceUri) {
//				httpOptions[this.proxyParamName] = serviceUri;
//				serviceUri = this.proxyServiceUri;
//			}
			
		
			var result = ns.execQuery(this.serviceUri, this.defaultGraphUris, this.queryString, this.httpArgs, this.ajaxOptions);

			return result;
		}
	});

	

    ns.QueryExecutionCache = Class.create(ns.QueryExecution, {
         initialize: function(queryExecution, cacheKey, executionCache, resultCache) {
             this.queryExecution = queryExecution;
             
             this.cacheKey = cacheKey;
             
             this.executionCache = executionCache;
             this.resultCache = resultCache;
         },
         
         execSelect: function() {
             var cacheKey = this.cacheKey;
             var resultCache = this.resultCache;
             var executionCache = this.executionCache;
             
             
             // Check the cache whether the same query is already running
             // Re-use its promise if this is the case
             
             // TODO Reusing promises must take timeouts into account
             
             var promise = executionCache[cacheKey];
             var result;
             
             if(promise) {
                 //console.log('[DEBUG] QueryCache: Reusing promise for cacheKey: ' + cacheKey);
                 result = promise;
             }
             else {
                 var deferred = $.Deferred();

                 // Check if there is an entry in the result cache
                 var data = resultCache.getItem(cacheKey);
                 if(data) {                     
                     //console.log('[DEBUG] QueryCache: Reusing cache entry for cacheKey: ' + cacheKey);
                     deferred.resolve(data);
                 }
                 else {
                     var request = this.queryExecution.execSelect();
                     
                     executionCache[cacheKey] = request;
                     
                     request.pipe(function(rs) {
                         delete executionCache[cacheKey]; 

                         var arr = [];
                         while(rs.hasNext()) {
                             var binding = rs.nextBinding();
                             arr.push(binding);
                         }
                         
                         //console.log('[DEBUG] QueryCache: Caching result for cacheKey: ' + cacheKey);
                         resultCache.setItem(cacheKey, arr);
                     
                         deferred.resolve(arr);
                     }).fail(function() {
                         deferred.fail();
                     });
                                          
                 }

                 result = deferred.pipe(function(arr) {
                     var itBinding = new util.IteratorArray(arr);
                     var r = new ns.ResultSetArrayIteratorBinding(itBinding);
                     return r;
                 });
             }
             
             return result;
         } 
     });

	
})(jQuery);
