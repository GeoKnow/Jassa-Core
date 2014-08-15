var Class = require('../../ext/Class');

var HashMap = require('../../util/collection/HashMap');

var ExprVar = require('../../sparql/expr/ExprVar');
var E_OneOf = require('../../sparql/expr/E_OneOf');
var ElementFilter = require('../../sparql/element/ElementFilter');
var ElementGroup = require('../../sparql/element/ElementGroup');

var ResultSetUtils = require('../ResultSetUtils');
var LookupServiceBase = require('./LookupServiceBase');

var LookupServiceSparqlQuery = Class.create(LookupServiceBase, {
    initialize: function(sparqlService, query, v) {
        this.sparqlService = sparqlService;
        this.query = query;
        this.v = v;
    },

    /**
     * @param uris An array of rdf.Node objects that represent URIs
     */
    lookup: function(uris) {
        var v = this.v;
        var result;
        if(uris.length === 0) {
            result = jQuery.Deferred();
            result.resolve(new HashMap());
        } else {
            var q = this.query.clone();

            var filter = new ElementFilter(new E_OneOf(new ExprVar(v), uris));

            var element = new ElementGroup([q.getQueryPattern(), filter]);
            q.setQueryPattern(element);

            var qe = this.sparqlService.createQueryExecution(q);
            result = qe.execSelect().pipe(function(rs) {
                var r = ResultSetUtils.partition(rs, v);
                return r;
            });

            return result;
        }
    }
});

module.exports = LookupServiceSparqlQuery;
