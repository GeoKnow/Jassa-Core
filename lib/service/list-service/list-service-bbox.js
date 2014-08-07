var ListService = require('./list-service');
// FIXME: this depends on sponade components, what to do?
var StoreFacade = function(){}; //require('../sponade/store-facade');

var ListServiceBbox = function(sparqlService, geoMapFactory, concept) {
    ListService.call(this);

    this.initialize(sparqlService, geoMapFactory, concept);
};
// inherit
ListServiceBbox.prototype = Object.create(ListService.prototype);
// hand back the constructor
ListServiceBbox.prototype.constructor = ListServiceBbox;

ListServiceBbox.prototype.initialize = function(sparqlService, geoMapFactory, concept) {
    this.sparqlService = sparqlService;
    this.geoMapFactory = geoMapFactory;
    this.concept = concept;

    // this.fnGetBBox = fnGetBBox || defaultDocWktExtractorFn;
    // TODO How to augment the data provided by the geoMapFactory?
};

ListServiceBbox.prototype.createFlow = function(bounds) {
    var store = new StoreFacade(this.sparqlService); // ,
    // prefixes);
    var geoMap = this.geoMapFactory.createMap(bounds);
    store.addMap(geoMap, 'geoMap');
    return store.geoMap;
};

ListServiceBbox.prototype.fetchItems = function(bounds, limit, offset) {
    var loadFlow = this.createFlow(bounds).find().concept(this.concept).limit(limit).offset(offset);
    var result = loadFlow.asList(true);
    return result;
};

ListServiceBbox.prototype.fetchCount = function(bounds, threshold) {
    var countFlow = this.createFlow(bounds).find().concept(this.concept).limit(threshold);
    var result = countFlow.count();
    return result;
};

module.exports = ListServiceBbox;