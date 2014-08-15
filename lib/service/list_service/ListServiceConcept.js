var ListService = require('./ListService');

var ListServiceConcept = Class.create(ListService, {
    initialize: function(sparqlService) {
        this.sparqlService = sparqlService;
    },

    fetchItems: function(concept, limit, offset) {
        var result = facete.ConceptUtils.fetchItems(this.sparqlService, concept, limit, offset);
        return result;
    },

    fetchCount: function(concept, itemLimit, rowLimit) {
        var result = ns.ServiceUtils.fetchCountConcept(this.sparqlService, concept, itemLimit, rowLimit);
        return result;
    },

});
