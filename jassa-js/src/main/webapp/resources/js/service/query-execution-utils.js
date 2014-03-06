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

				var node = binding.get(variable);
				result.push(node);
			}
			return result;
		},
			
		// TODO: If there is only one variable in the rs, use it.
		resultSetToInt: function(rs, variable) {
			var result = null;

			if(rs.hasNext()) {
				var binding = rs.nextBinding();

				var node = binding.get(variable);
				
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
		
		
		/**
		 * Count the results of a query, whith fallback on timeouts
		 * TODO Finish
		 */
		fetchCountQuery: function(sparqlService, query, firstTimeoutInMs, fallbackCount) {
		    var qe = sparqlService.createQueryExecution(query);
		    qe.setTimeout(timeoutInMs);

		    var countVar = null;
		    
		    var result = jQuery.Deferred();
		    ns.ServiceUtils.fetchInt(qe, countVar).done(function(count) {
		        result.resolve({
		            count: count,
		            hasMoreItems: false
		        });
		    }).fail(function() {
		        // Try counting with the fallback size
		        
		    });
		    
		    var result = deferred.promise();
		    return result;
		},

	    
	    //ns.globalSparqlCacheQueue = [];
	    
	    /**
	     * 
	     * @param baseURL
	     * @param query
	     * @param callback
	     * @param format
	     */
		createSparqlRequestAjaxSpec: function(baseUrl, defaultGraphIris, queryString, dataDefaults, ajaxDefaults) {
            var data = {
                'query': queryString,
                'default-graph-uri': defaultGraphIris,
            };

            var result = {
		        url: baseUrl,
		        dataType: 'json',
		        crossDomain: true,
		        traditional: true,
		        data: data
		    };
		    
		    _(data).defaults(dataDefaults);
		    _(result).defaults(ajaxDefaults);
		    
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
