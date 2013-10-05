(function() {

	// FIXME: Maybe rename to SparqlServicePaginate(d)?
	var ns = Jassa.sparql;	
	

	ns.Paginator = function(query, pageSize) {
		this.query = query;
		this.nextOffset = query.offset ? query.offset : 0;
		this.nextRemaining = (query.limit || query.limit === 0) ? query.limit : null;
		
		this.pageSize = pageSize;
	};
	
	
	// Returns the next limit and offset
	ns.Paginator.prototype.next = function() {
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
	};
	
	ns.SparqlServicePaginator = function(backend, pageSize) {
		this.backend = backend;
		this.pageSize = pageSize ? pageSize : 0;
	};
	
	ns.SparqlServicePaginator.prototype = {
		getStateHash: function() {
			return this.backend.getStateHash();
		}	
	};
	
	/*
	ns.SparqlServicePaginator.prototype.executeConstructRec = function(paginator, prevResult, deferred) {
		
	};
	*/
	
	ns.SparqlServicePaginator.prototype.executeSelectRec = function(paginator, prevResult, deferred) {
		var query = paginator.next();
		if(!query) {
			deferred.resolve(prevResult);
			return;
		}
		
		var self = this;
		
		
		//console.log("Backend: ", this.backend);
		
		var queryExecution = this.backend.executeSelect(query); 
		queryExecution.done(function(jsonRs) {

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
	};
	
	ns.SparqlServicePaginator.prototype.executeSelect = function(query) {
		var clone = query.clone();
		var paginator = new ns.Paginator(clone, this.pageSize);
		
		var deferred = $.Deferred();
		
		this.executeSelectRec(paginator, null, deferred);
		
		return deferred.promise();
	};
	
	ns.SparqlServicePaginator.prototype.executeConstruct = function(query) {
		console.error("Not implemented yet");
	};

})();

