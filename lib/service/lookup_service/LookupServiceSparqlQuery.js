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
    lookup: function(uris) {
        //console.log('LOOKUP: ' + JSON.stringify(uris));
        var containsNull = uris.some(function(item) {
            var r = item == null;
            return r;
        });

        if(containsNull) {
            throw new Error('Lookup requests must not include null values as it most likely indicates a problem');
        }


        var v = this.v;
        var result;
        if(uris.length === 0) {
            result = Promise.resolve(new HashMap());
        } else {
            var q = this.query.clone();

            //console.log('Uris: ' + uris.length + ' ' + JSON.stringify(uris));
            //throw new Error('here');

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
    }
});

module.exports = LookupServiceSparqlQuery;
