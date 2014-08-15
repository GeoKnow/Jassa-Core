var Class = require('../../ext/Class');

var shared = require('../../util/shared');
var Promise = shared.Promise;

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
    lookup: Promise.method(function(uris) {
        var v = this.v;
        var result;
        if(uris.length === 0) {
            result = Promise.resolve(new HashMap());
        } else {
            var q = this.query.clone();

            var filter = new ElementFilter(new E_OneOf(new ExprVar(v), uris));

            var element = new ElementGroup([q.getQueryPattern(), filter]);
            q.setQueryPattern(element);

            var qe = this.sparqlService.createQueryExecution(q);
            result = qe.execSelect().then(function(rs) {
                var r = ResultSetUtils.partition(rs, v);
                return r;
            });
        }
        
        return result;
    })
});

module.exports = LookupServiceSparqlQuery;
