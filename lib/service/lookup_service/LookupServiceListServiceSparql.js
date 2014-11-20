var Class = require('../../ext/Class');

var shared = require('../../util/shared');
var Promise = shared.Promise;

var HashMap = require('../../util/collection/HashMap');

var Concept = require('../../sparql/Concept');

var VarUtils = require('../../sparql/VarUtils');

var ExprVar = require('../../sparql/expr/ExprVar');
var E_OneOf = require('../../sparql/expr/E_OneOf');
var ElementFilter = require('../../sparql/element/ElementFilter');

var LookupServiceBase = require('./LookupServiceBase');


var LookupServiceListServiceSparql = Class.create(LookupServiceBase, {
    initialize: function(listService) {
        this.listService = listService;
    },

    /**
     * @param uris An array of rdf.Node objects that represent URIs
     */
    lookup: function(nodes) {
        var v = VarUtils.s;
        var element = new ElementFilter(new E_OneOf(new ExprVar(v), nodes));

        var concept = new Concept(element, v);

        var result = this.listService.fetchItems(concept)
            .then(function(entries) {
                var r = new HashMap();
                r.putEntries(entries);
                return r;
            });

        return result;
    }
});

module.exports = LookupServiceListServiceSparql;
