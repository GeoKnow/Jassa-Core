var Class = require('../../ext/Class');
var ServiceUtils = require('../ServiceUtils');
var ListService = require('./ListService');

var ListServiceConcept = Class.create(ListService, {
    initialize: function(sparqlService) {
        this.sparqlService = sparqlService;
    },

    fetchItems: function(concept, limit, offset) {
        var result = ServiceUtils.fetchItemsConcept(this.sparqlService, concept, limit, offset);
        return result;
    },

    fetchCount: function(concept, itemLimit, rowLimit) {
        var result = ServiceUtils.fetchCountConcept(this.sparqlService, concept, itemLimit, rowLimit);
        return result;
    },

});
