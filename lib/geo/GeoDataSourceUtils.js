(function() {

    var ns = jassa.geo;
    var sparql = jassa.sparql;
    var service = jassa.service;

    ns.GeoDataSourceUtils = {

        /**
         *
         * @param attrs Additional static attributes, such as style information
         */
        createGeoDataSourceLabels: function(sparqlService, geoMapFactory, concept, attrs) {

            if(attrs == null) {
                attrs = {};
            }

            // The 'core' service from which to retrieve the initial data
            var bboxListService = new service.ListServiceBbox(sparqlService, geoMapFactory, concept);

            // Wrap this service for augmenting (enriching) it with labels
            var lookupServiceLabels = sponate.LookupServiceUtils.createLookupServiceNodeLabels(sparqlService);
            lookupServiceLabels = new service.LookupServiceTransform(lookupServiceLabels, function(doc, id) {
                var result = {
                    shortLabel: doc
                };                    
                return result;
            });
                
            var augmenterLabels = new service.AugmenterLookup(lookupServiceLabels);
            bboxListService = new service.ListServiceAugmenter(bboxListService, augmenterLabels);
            
            // Also add style information
            var lookupServiceStyle = new service.LookupServiceConst(attrs);
    
            var augmenterStyle = new service.AugmenterLookup(lookupServiceStyle);
            bboxListService = new service.ListServiceAugmenter(bboxListService, augmenterStyle);
            
            // Wrap the list service with clustering support
            var result = new service.DataServiceBboxCache(bboxListService, 1500, 500, 2);
            
            return result;
        }
    };    
        
})();
