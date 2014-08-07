var SparqlService = require('./sparql-service');
var E_Count = require('../../sparql/e-count');
var Query = require('../../sparql/query');
var ElementSubQuery = require('../../sparql/element-sub-query');

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
var SparqlServiceVirtFix = function(sparqlService) {
    SparqlService.call(this);

    this.initialize(sparqlService);
};
// inherit
SparqlServiceVirtFix.prototype = Object.create(SparqlService.prototype);
// hand back the constructor
SparqlServiceVirtFix.prototype.constructor = SparqlServiceVirtFix;



SparqlServiceVirtFix.prototype.initialize = function(sparqlService) {
    this.sparqlService = sparqlService;
};

SparqlServiceVirtFix.prototype.getServiceId = function() {
    return this.sparqlService.getServiceId();
};

SparqlServiceVirtFix.prototype.getStateHash = function() {
    return this.sparqlService.getStateHash();
};

SparqlServiceVirtFix.prototype.hashCode = function() {
    return 'virtfix:' + this.sparqlService.hashCode();
};

SparqlServiceVirtFix.prototype.hasAggregate = function(query) {
    var entries = query.getProject().entries();

    var result = false;
    entries.forEach(function(entry) {
        var expr = entry.expr;
        if (expr instanceof E_Count) {
            result = result || true;
        }
    });

    return result;
};

SparqlServiceVirtFix.prototype.createQueryExecution = function(query) {
    var orderBy = query.getOrderBy();
    var limit = query.getLimit();
    var offset = query.getOffset();

    var hasAggregate = this.hasAggregate(query);

    var isTransformNeeded = orderBy.length > 0 && (limit || offset) || hasAggregate;

    var q;
    if (isTransformNeeded) {
        var subQuery = query.clone();
        subQuery.setLimit(null);
        subQuery.setOffset(null);

        q = new Query();
        var e = new ElementSubQuery(subQuery);
        q.getElements().push(e);
        q.setLimit(limit);
        q.setOffset(offset);
        q.setResultStar(true);

    } else {
        q = query;
    }

    var result = this.sparqlService.createQueryExecution(q);
    return result;
};

module.exports = SparqlServiceVirtFix;