(function($) {

    var util = Jassa.util;
    var sparql = Jassa.sparql;
    
	var ns = Jassa.service;

    // Great! Writing to the object in a deferred done handler causes js to freeze...
    ns.globalSparqlCache = {};

	ns.ServiceUtils = {
	
		/**
		 * TODO Rather use .close()
		 * 
		 * @param rs
		 * @returns
		 */
		consumeResultSet: function(rs) {
			while(rs.hasNext()) {
				rs.nextBinding();
			};
		},
			
		resultSetToList: function(rs, variable) {
			var result = [];
			while(rs.hasNext()) {
				var binding = rs.nextBinding();

				var node = binding.get(variable.getName());
				result.push(node);
			}
			return result;
		},
			
		// TODO: If there is only one variable in the rs, use it.
		resultSetToInt: function(rs, variable) {
			var result = null;

			if(rs.hasNext()) {
				var binding = rs.nextBinding();

				var node = binding.get(variable.getName());
				
				// TODO Validate that the result actually is int.
				result = node.getLiteralValue();
			}
			
			return result;
		},

		
		fetchList: function(queryExecution, variable) {
			var self = this;
			var result = queryExecution.execSelect().pipe(function(rs) {
				var r = self.resultSetToList(rs, variable);
				return r;
			});
		
			return result;		
		},
		
		
		/**
		 * Fetches the first column of the first row of a result set and parses it as int.
		 * 
		 */
		fetchInt: function(queryExecution, variable) {
			var self = this;
			var result = queryExecution.execSelect().pipe(function(rs) {
				var r = self.resultSetToInt(rs,variable);
				return r;
			});

			return result;
		},
		
		
		
	    
	    //ns.globalSparqlCacheQueue = [];
	    
	    /**
	     * Adapted from http://www.openlinksw.com/blog/~kidehen/?id=1653
	     * 
	     * @param baseURL
	     * @param query
	     * @param callback
	     * @param format
	     */
	    execQuery: function(baseURL, defaultGraphUris, query, httpArgsEx, ajaxOptions) {
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
	        
//	      while(cacheQueue.length > 0) {
//	          var item = cacheQueue.pop();
//	          
//	          cache[item.hash] = item.response;
//	      }
	        
	        if(useCache) {
	            hash = JSONCanonical.stringify(ajaxObj); //JSONCanonical.stringify(ajaxObj);
	            var rawData = cache[hash];
	            if(rawData) {
	                data = JSON.parse(rawData);
	            }
	            //console.log('SPARQL Data for hash ' + hash, data);    
	        }

	        var result = $.Deferred();
	        if(data) { 
	            result.resolve(data);
	        } else {
	            var result = $.ajax(ajaxObj);
	            
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
	    },
	
           // TODO Maybe move to a conversion utils package.
        jsonToResultSet: function(json) {
        
            var varNames = json.head.vars;
            var bindings = json.results.bindings;
        
            var tmp = bindings.map(function(b) {
                var bindingObj = sparql.Binding.fromTalisJson(b);
                return bindingObj;                  
            });
            
            var itBinding = new util.IteratorArray(tmp);
            
            var result = new ns.ResultSetArrayIteratorBinding(itBinding, varNames);
            return result;
        }
	};

})(jQuery);