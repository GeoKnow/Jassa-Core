var Class = require('../../ext/class');
var ListService = require('./list-service');
var ServiceUtils = require('../service-utils');
var shared = require('../../util/shared');
var Promise = shared.Promise;
// FIXME: depends on facete - what to do?
var ConceptUtils = {}; // require('../facete/concept-utils');

var ListServiceConceptKeyLookup = Class.create(ListService, {
    initialize: function(sparqlService, keyLookupService) {
        this.sparqlService = sparqlService;
        this.keyLookupService = keyLookupService;
    },

    fetchItems: Promise.method(function(concept, limit, offset) {
        var query = ConceptUtils.createQueryList(concept, limit, offset);

        var self = this;
        ServiceUtils
            .fetchList(query, concept.getVar())
            .then(function(items) {
                return self.keyLookupService.lookup(items);
            })
            .then(function(map) {
                return map;
            });
    }),

    fetchCount: function(concept, threshold) {
        var result = ServiceUtils.fetchCountConcept(concept, threshold);
        return result;
    },
});

module.exports = ListServiceConceptKeyLookup;
