/**
 * Sparql endpoint class.
 * Allows execution of sparql queries against a preconfigured service
 * 
 */			
(function() {

	var ns = Jassa.sparql;
	
	/**
	 * SparqlServiceHttp
	 * 
	 * 
	 * @param serviceUri The HTTP service URL where to send the query to
	 * @param defaultGraphUris The RDF graphs on which to run the query by default
	 * @param httpArgs A JSON object with additional arguments to include in HTTP requests
	 */
	ns.SparqlServiceHttp = function(serviceUri, defaultGraphUris, httpArgs) {
		this.serviceUri = serviceUri;
		this.setDefaultGraphs(defaultGraphUris);
		
		this.httpArgs = httpArgs;
	};
	
	ns.SparqlServiceHttp.prototype = {
			
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
	

		execSelect: function(query, options) {
			return this.execAny(query, options);
		},
	
		execAsk: function(query, options) {
			return this.execAny(query, options).pipe(function(json) { return json['boolean']; });
		},
	
		// TODO What to return: e.g. RdfJson vs RdfQuery
		execConstruct: function(query, options) {
			return this.execAny(query, options);
		},
	
	
		execDescribe: function(query, options) {
			return this.execAny(query, options);
		}
	};

	
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

	

	// Great! Writing to the object in a deferred done handler causes js to freeze...
	ns.globalSparqlCache = {};
	
	//ns.globalSparqlCacheQueue = [];
	
	/**
	 * Adapted from http://www.openlinksw.com/blog/~kidehen/?id=1653
	 * 
	 * @param baseURL
	 * @param query
	 * @param callback
	 * @param format
	 */
	ns.execQuery = function(baseURL, defaultGraphUris, query, httpArgsEx, ajaxOptions) {
		var options = {};
		
		if(ajaxOptions == null) {
			ajaxOptions = {};
		}
		
		options.format = ajaxOptions.format ? ajaxOptions.format : 'application/json'; 
		
		var params = _.map(defaultGraphUris, function(item) {
			var pair = {key: "default-graph-uri", value: item };
			return pair;
		});
		
		params.push({key: "query", value: query});
	
		_.each(httpArgsEx, function(v, k) {
			
			if(_(v).isArray()) {
				for(var i = 0; i < v.length; ++i) {
					var t = v[i];

					params.push({key: k, value: t});
				}
			} else {			
				params.push({key: k, value: v});
			}
		});
		
		var querypart = '';
		_.each(params, function(param) {
			querypart += param.key + '=' + encodeURIComponent(param.value) + '&';
		});

		var url = baseURL + '?' + querypart;

		var ajaxObj = {
			url: url,
			dataType: 'json'
		};

		if(ajaxOptions) {
			_.extend(ajaxObj, ajaxOptions);
		}

		
		var useCache = false;
		
		var data = null;
		var hash = null;
		
		
		var cache = ns.globalSparqlCache;
		//var cacheQueue = ns.globalSparqlCacheQueue;
		
//		while(cacheQueue.length > 0) {
//			var item = cacheQueue.pop();
//			
//			cache[item.hash] = item.response;
//		}
		
		if(useCache) {
			hash = JSONCanonical.stringify(ajaxObj); //JSONCanonical.stringify(ajaxObj);
			var rawData = cache[hash];
			if(rawData) {
				data = JSON.parse(rawData);
			}
			//console.log('SPARQL Data for hash ' + hash, data);	
		}

		var result = jQuery.Deferred();
		if(data) { 
			result.resolve(data);
		} else {
			var result = jQuery.ajax(ajaxObj);
			
			if(useCache) {
				result.pipe(function(response) {

					
					cache[hash] = JSON.stringify(response);
					//alert(response);
					//c[hash] = response;
					//cache[hash.substr(0, 6)] = response;
					//cacheQueue.push({hash: hash, response: response});
				});

				//ns.running[hash] = result;
			}
		}
		
		return result;
	};

})();

