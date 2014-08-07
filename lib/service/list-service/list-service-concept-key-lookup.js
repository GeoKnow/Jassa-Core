var ListService = require('./list-service');
var ServiceUtils = require('./service-utils');
// FIXME: depends on facete - what to do?
var ConceptUtils = {}; //require('../facete/concept-utils');

var ListServiceConceptKeyLookup = function(sparqlService, keyLookupService) {
    ListService.call(this);

    this.initialize(sparqlService, keyLookupService);
};
// inherit
ListServiceConceptKeyLookup.prototype = Object.create(ListService.prototype);
// hand back the constructor
ListServiceConceptKeyLookup.prototype.constructor = ListServiceConceptKeyLookup;



ListServiceConceptKeyLookup.prototype.initialize = function(sparqlService, keyLookupService) {
    this.sparqlService = sparqlService;
    this.keyLookupService = keyLookupService;
};

ListServiceConceptKeyLookup.prototype.fetchItems = function(concept, limit, offset) {
    var query = ConceptUtils.createQueryList(concept, limit, offset);

    var deferred = $.Deferred();

    var self = this;
    ServiceUtils.fetchList(query, concept.getVar()).pipe(function(items) {

        self.keyLookupService.lookup(items).pipe(function(map) {
            deferred.resolve(map);
        }).fail(function() {
            deferred.fail();
        });
    }).fail(function() {
        deferred.fail();
    });

    return deferred.promise();
};

ListServiceConceptKeyLookup.prototype.fetchCount = function(concept, threshold) {
    var result = ServiceUtils.fetchCountConcept(concept, threshold);
    return result;
};

module.exports = ListServiceConceptKeyLookup;
