(function() {

    var util = Jassa.util;
    
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
	
	    getPageSize: function() {
	        return this.pageSize;
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
	
	
	ns.QueryExecutionPaginate = Class.create(ns.QueryExecution, {
	    initialize: function(sparqlService, query, pageSize) {
	        this.sparqlService = sparqlService;
	        this.query = query;
	        this.pageSize = pageSize;
	    },
	    
        executeSelectRec: function(queryPaginator, prevResult, deferred) {
            var query = queryPaginator.next();
            if(!query) {
                deferred.resolve(prevResult);
                return;
            }
            
            var self = this;
            //console.log("Backend: ", this.backend);
            
            this.sparqlService.createQueryExecution(query).execSelect().done(function(rs) {
    
                if(!rs) {
                    throw "Null result set for query: " + query;
                }

                                
                // If result set size equals pageSize, request more data.           
                var result;
                if(!prevResult) {
                    result = rs;
                } else {
                    // Extract the arrays that backs the result set ...
                    var oldArr = prevResult.getIterator().getArray();
                    var newArr = rs.getIterator().getArray();
                    
                    // ... and concatenate them
                    var nextArr = oldArr.concat(newArr);

                    var itBinding = new util.IteratorArray(nextArr);
                    result = new ns.ResultSetArrayIteratorBinding(itBinding);
                }
                
                var resultSetSize = rs.getIterator().getArray().length;
                //console.debug("ResultSetSize, PageSize: ", resultSetSize, self.pageSize);                
                var pageSize = queryPaginator.getPageSize();

                if(resultSetSize === 0 || resultSetSize < pageSize) {
                    deferred.resolve(result);
                } else {                
                    return self.executeSelectRec(queryPaginator, result, deferred);
                }
                
            }).fail(function() {
                deferred.fail();
            });
        },
        
        execSelect: function() {
            var clone = this.query.clone();
            var pageSize = this.pageSize || ns.QueryExecutionPaginate.defaultPageSize;
            var paginator = new ns.QueryPaginator(clone, pageSize);
            
            var deferred = $.Deferred();
            
            this.executeSelectRec(paginator, null, deferred);
            
            return deferred.promise();
        }
	});

	ns.QueryExecutionPaginate.defaultPageSize = 1000;

	ns.SparqlServicePaginate = Class.create(ns.SparqlService, {
	    initialize: function(sparqlService, pageSize) {
    		this.sparqlService = sparqlService;
    		this.pageSize = pageSize;
	    },
	
	    getServiceId: function() {
	        return this.sparqlService.getServiceId();
	    },
	    
		getStateHash: function() {
			return this.sparqlService.getStateHash();
		},
	
		createQueryExecution: function(query) {
		    var result = new ns.QueryExecutionPaginate(this.sparqlService, query, this.pageSize);
		    return result;
		}
    });

})();

