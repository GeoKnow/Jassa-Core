var Class = require('../../ext/class');
var ListService = require('./list-service');
// FIXME: this depends on sponade components, what to do?
var StoreFacade = function() {}; //require('../sponade/store-facade');

var ListServiceBbox = Class.create(ListService, {
    initialize: function(sparqlService, geoMapFactory, concept) {
        this.sparqlService = sparqlService;
        this.geoMapFactory = geoMapFactory;
        this.concept = concept;

        // this.fnGetBBox = fnGetBBox || defaultDocWktExtractorFn;
        // TODO How to augment the data provided by the geoMapFactory?
    },

    createFlow: function(bounds) {
        var store = new StoreFacade(this.sparqlService); // ,
        // prefixes);
        var geoMap = this.geoMapFactory.createMap(bounds);
        store.addMap(geoMap, 'geoMap');
        return store.geoMap;
    },

    fetchItems: function(bounds, limit, offset) {
        var loadFlow = this.createFlow(bounds).find().concept(this.concept).limit(limit).offset(offset);
        var result = loadFlow.asList(true);
        return result;
    },

    fetchCount: function(bounds, threshold) {
        var countFlow = this.createFlow(bounds).find().concept(this.concept).limit(threshold);
        var result = countFlow.count();
        return result;
    },
});

module.exports = ListServiceBbox;
