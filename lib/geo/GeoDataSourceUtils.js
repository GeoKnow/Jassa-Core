var LookupServiceUtils = require('../service/LookupServiceUtils');
var LookupServiceConst = require('../service/lookup_service/LookupServiceConst');
var LookupServiceTransform = require('../service/lookup_service/LookupServiceTransform');
var ListServiceAugmenter = require('../service/list_service/ListServiceAugmenter');
var AugmenterLookup = require('../service/list_service/AugmenterLookup');
var BestLabelConfig = require('../sparql/BestLabelConfig');

var ListServiceBbox = require('./ListServiceBbox');
var DataServiceBboxCache = require('./DataServiceBboxCache');
var LookupServiceUtils = require('../sponate/LookupServiceUtils');
var MappedConceptUtils = require('../sponate/MappedConceptUtils');


var GeoDataSourceUtils = {

    /**
     *
     * @param attrs Additional static attributes, such as style information
     */
    createGeoDataSourceLabels: function(sparqlService, geoMapFactory, concept, attrs) {

        if(attrs == null) {
            attrs = {};
        }

        // The 'core' service from which to retrieve the initial data
        var bboxListService = new ListServiceBbox(sparqlService, geoMapFactory, concept);

        // Wrap this service for augmenting (enriching) it with labels
        //var lookupServiceLabels = SponateLookupServiceUtils.createLookupServiceNodeLabels(sparqlService);
        var blc = new BestLabelConfig();
        var mappedConcept = MappedConceptUtils.createMappedConceptBestLabel(blc);
        var lookupServiceLabels = LookupServiceUtils.createLookupServiceMappedConcept(sparqlService, mappedConcept);


        lookupServiceLabels = new LookupServiceTransform(lookupServiceLabels, function(doc, id) {
            var result = {
                shortLabel: doc
            };
            return result;
        });

        var augmenterLabels = new AugmenterLookup(lookupServiceLabels);
        bboxListService = new ListServiceAugmenter(bboxListService, augmenterLabels);

        // Also add style information
        var lookupServiceStyle = new LookupServiceConst(attrs);

        var augmenterStyle = new AugmenterLookup(lookupServiceStyle);
        bboxListService = new ListServiceAugmenter(bboxListService, augmenterStyle);

        // Wrap the list service with clustering support
        var result = new DataServiceBboxCache(bboxListService, 1500, 500, 2);

        return result;
    }
};

module.exports = GeoDataSourceUtils;
