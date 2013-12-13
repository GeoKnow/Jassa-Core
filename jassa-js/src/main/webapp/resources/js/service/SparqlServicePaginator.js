(function() {

	var ns = Jassa.service;	
	

	/**
	 * Takes a query and upon calling 'next' updates its limit and offset values accordingly
	 * 
	 */
	ns.QueryPaginator = Class.create({
	    initialize: function(query, pageSize) {
    		this.query = query;
    		
    		var queryOffset = query.getOffset();
            var queryLimit = query.getLimit();

            this.nextOffset = queryOffset ? queryOffset : 0;
    		this.nextRemaining = (queryLimit || queryLimit === 0) ? queryLimit : null;
    		
    		this.pageSize = pageSize;
	    },
	
	
	    // Returns the next limit and offset
	    next: function() {
    		this.query.offset = this.nextOffset === 0 ? null : this.nextOffset;
    
    		if(this.nextRemaining == null) {
    			this.query.limit = this.pageSize;
    			this.nextOffset += this.pageSize;
    		} else {
    			var limit = Math.min(this.pageSize, this.nextRemaining);
    			this.nextOffset += limit;
    			this.nextRemaining -= limit;
    			
    			if(limit === 0) {
    				return null;
    			}
    			
    			this.query.limit = limit;
    		}
    		
    		return this.query;
    	}
	});
	
	ns.SparqlServicePaginator = Class.create(ns.SparqlService, {
	    initialize: function(sparqlService, pageSize) {
    		this.sparqlService = sparqlService;
    		this.pageSize = pageSize ? pageSize : 0;
	    },
	
		getStateHash: function() {
			return this.sparqlService.getStateHash();
		},	
	
	/*
	ns.SparqlServicePaginator.prototype.executeConstructRec = function(paginator, prevResult, deferred) {
		
	};
	*/
	
    	executeSelectRec: function(queryPaginator, prevResult, deferred) {
    		var query = queryPaginator.next();
    		if(!query) {
    			deferred.resolve(prevResult);
    			return;
    		}
    		
    		var self = this;
    		
    		
    		//console.log("Backend: ", this.backend);
    		
    		this.sparqlService.execSelect(query).done(function(rs) {
    
    			if(!jsonRs) {
    				throw "Null result set for query: " + query;
    			}
    			
    			// If result set size equals pageSize, request more data.			
    			var result;
    			if(!prevResult) {
    				result = jsonRs;
    			} else {
    				prevResult.results.bindings = prevResult.results.bindings.concat(jsonRs.results.bindings);
    				result = prevResult;
    			}
    			
    			var resultSetSize = jsonRs.results.bindings.length;
    			//console.debug("ResultSetSize, PageSize: ", resultSetSize, self.pageSize);
    			if(resultSetSize < self.pageSize) {
    				deferred.resolve(result);
    			} else {				
    				return self.executeSelectRec(paginator, result, deferred);
    			}
    			
    		}).fail(function() {
    			deferred.fail();
    		});
    	},
    	
    	execSelect: function(query) {
    		var clone = query.clone();
    		var paginator = new ns.Paginator(clone, this.pageSize);
    		
    		var deferred = $.Deferred();
    		
    		this.executeSelectRec(paginator, null, deferred);
    		
    		return deferred.promise();
    	},
    	
    	execConstruct: function(query) {
    		console.error("Not implemented yet");
    	}
    });

})();

