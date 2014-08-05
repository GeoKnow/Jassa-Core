(function() {
	
    var util = Jassa.util;
    var sparql = Jassa.sparql;

	var ns = Jassa.service;	
	
	
	/**
	 * Transforms query using sorting with limit/offset
	 * 
	 * Select { ... } Order By {sortConditions} Limit {limit} Offset {offset} ->
	 * 
	 * Select * { { Select { ... } Order By {sortConditions} } } Limit {limit} Offset {offset}
	 * 
	 * Warning: This transformation may not work cross-database:
	 * Database management systems may discard ordering on sub queries (which is SQL compliant). 
	 * 
	 */
    ns.SparqlServiceVirtFix = Class.create(ns.SparqlService, {
        initialize: function(sparqlService) {
            this.sparqlService = sparqlService;
        },
    
        getServiceId: function() {
            return this.sparqlService.getServiceId();
        },
        
        getStateHash: function() {
            return this.sparqlService.getStateHash();
        },

        hashCode: function() {
            return 'virtfix:' + this.sparqlService.hashCode();
        },

        hasAggregate: function(query) {
            var entries = query.getProject().entries();
            
            var result = _(entries).some(function(entry) {
                var expr = entry.expr;
                if(expr instanceof sparql.E_Count) {
                    return true;
                }
            });
            
            return result;
        },
        
        createQueryExecution: function(query) {
            
            var orderBy = query.getOrderBy();
            var limit = query.getLimit();
            var offset = query.getOffset();
            
            var hasAggregate = this.hasAggregate(query);
            
            var isTransformNeeded = orderBy.length > 0 && (limit || offset) || hasAggregate;
            
            var q;
            if(isTransformNeeded) {
                var subQuery = query.clone();
                subQuery.setLimit(null);
                subQuery.setOffset(null);
                
                q = new sparql.Query();
                var e = new sparql.ElementSubQuery(subQuery);
                q.getElements().push(e);
                q.setLimit(limit);
                q.setOffset(offset);
                q.setResultStar(true);
                
            } else {
                q = query;
            }
            
            var result = this.sparqlService.createQueryExecution(q);
            return result;
        }        
    });

})();	
	
