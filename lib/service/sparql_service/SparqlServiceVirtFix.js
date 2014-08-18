var Class = require('../../ext/Class');
var SparqlService = require('./SparqlService');
var E_Count = require('../../sparql/expr/E_Count');
var Query = require('../../sparql/Query');
var ElementSubQuery = require('../../sparql/element/ElementSubQuery');

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
var SparqlServiceVirtFix = Class.create(SparqlService, {
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
        
        var result = entries.some(function(entry) {
            var expr = entry.expr;
            if(expr instanceof E_Count) {
                return true;
            }
        });
        
        return result;
    },

    createQueryExecution: function(query) {

        var orderBy = query.getOrderBy();
        var limit = query.getLimit();
        var offset = query.getOffset();

        // 2014-08-13 This query failed on http://dbpedia.org/sparql Select * { ?s ?p ?o } Offset 1
        // with Virtuoso 22023 Error SR350: TOP parameter < 0
        // We add an extra high limit to the query
        var isLimitUpdateNeeded = offset != null && limit == null;
        var hasAggregate = this.hasAggregate(query);
        var isTransformNeeded = orderBy.length > 0 && (limit || offset) || hasAggregate;

        var isCloneNeeded = isLimitUpdateNeeded || isTransformNeeded;

        var q = isCloneNeeded ? query.clone() : query;

        if(isLimitUpdateNeeded) {
            limit = 2000000000;
            q.setLimit(limit);
        }

        if(isTransformNeeded) {
            var subQuery = q;
            subQuery.setLimit(null);
            subQuery.setOffset(null);
            
            var e = new ElementSubQuery(subQuery);

            q = new Query();
            q.setQueryPattern(e);            
            q.setLimit(limit);
            q.setOffset(offset);
            q.setQueryResultStar(true);                
        }

        var result = this.sparqlService.createQueryExecution(q);
        return result;
    },

});

module.exports = SparqlServiceVirtFix;
