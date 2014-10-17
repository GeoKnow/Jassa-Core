var Class = require('../ext/Class');
var ListService = require('../service/list_service/ListService');
var StoreFacade = require('../sponate/facade/StoreFacade');

var ListServiceBbox = Class.create(ListService, {
    initialize: function(sparqlService, geoMapFactory, concept) {
        this.sparqlService = sparqlService;
        this.geoMapFactory = geoMapFactory;
        this.concept = concept;

        // this.fnGetBBox = fnGetBBox || defaultDocWktExtractorFn;
        // TODO How to augment the data provided by the geoMapFactory?
    },

    createListService: function(bounds) {
        var store = new StoreFacade(this.sparqlService); // ,
        // prefixes);
        var geoMap = this.geoMapFactory.createMap(bounds);
        var spec = {
            name: 'geoMap',
            template: geoMap
        };
        store.addMap(spec);
        var result = store.geoMap.getListService();
        return result;
    },

    fetchItems: function(bounds, limit, offset) {
        var listService = this.createListService(bounds);
        var result = listService.fetchItems(this.concept, limit, offset);

//        var result = listService.fetchItems(this.concept, limit, offset).then(function(r) {
//            console.log('GOT: ' + JSON.stringify(r));
//            return r;
//        });
        return result;
    },

    fetchCount: function(bounds, itemLimit, rowLimit) {
        var listService = this.createListService(bounds);
        var result = listService.fetchCount(this.concept, itemLimit, rowLimit);
        return result;
    },
});

module.exports = ListServiceBbox;
