//var Class = require('../ext/Class');
//
//
//var SparqlServiceHttp = require('./sparql_service/SparqlServiceHttp');
//var SparqlServicePaginate = require('./sparql_service/SparqlServicePaginate');
//var SparqlServicePageExpand = require('./sparql_service/SparqlServicePageExpand');
//var SparqlServiceCache = require('./sparql_service/SparqlServiceCache');
//var SparqlServiceVirtFix = require('./sparql_service/SparqlServiceVirtFix');
//var SparqlServiceLimit = require('./sparql_service/SparqlServiceLimit');
//
//
//var SparqlServiceBuilder = Class.create({
//    initialize: function(sparqlService) {
//        this.sparqlService = sparqlService;
//    },
//
//    create: function() {
//        return this.sparqlService;
//    },
//
//    paginate: function(pageSize) {
//        this.sparqlService = new SparqlServicePaginate(this.sparqlService, pageSize);
//        return this;
//    },
//
//    pageExpand: function(pageSize) {
//        this.sparqlService = new SparqlServicePageExpand(this.sparqlService, pageSize);
//        return this;
//    },
//
//    cache: function(requestCache) {
//        this.sparqlService = new SparqlServiceCache(this.sparqlService, requestCache);
//        return this;
//    },
//
//    virtFix: function() {
//        this.sparqlService = new SparqlServiceVirtFix(this.sparqlService);
//        return this;
//    },
//
//    limit: function(limit) {
//        this.sparqlService = new SparqlServiceLimit(this.sparqlService, limit);
//        return this;
//    },
//
//
////    delay: function() {
////        // does not exist yet
////    },
////    failover: function() {
////
////    },
//
//});
//
//// var sparqlService = SparqlServiceBuilder.http().limit(100000).virtFix().cache().paginate(1000).pageExpand(100).create();
//SparqlServiceBuilder.http = function(serviceUri, defaultGraphUris, ajaxOptions, httpArgs) {
//
//
//    // Init Lookup Service
//    // TODO: The label map must remain dynamic
//    var store = new sponate.StoreFacade(sparqlService);
//
//    var labelMap = sponate.SponateUtils.createDefaultLabelMap();
//    store.addMap(labelMap, 'labels');
//    var labelsStore = store.labels;
//
//    var lookupServiceNodeLabels = new service.LookupServiceSponate(labelsStore);
//    lookupServiceNodeLabels = new service.LookupServiceChunker(lookupServiceNodeLabels, 20);
//    lookupServiceNodeLabels = new service.LookupServiceIdFilter(lookupServiceNodeLabels, function(node) {
//        // TODO Using a proper URI validator would increase quality
//        var r = node && node.isUri();
//        if(r) {
//            var uri = node.getUri();
//            r = r && !_(uri).include(' ');
//            r = r && !_(uri).include('<');
//            r = r && !_(uri).include('>');
//        }
//        return r;
//    });
//    lookupServiceNodeLabels = new service.LookupServiceTimeout(lookupServiceNodeLabels, 20);
//    lookupServiceNodeLabels = new service.LookupServiceTransform(lookupServiceNodeLabels, function(doc, id) {
//        var result = doc ? doc.displayLabel : null;
//
//        if(!result) {
//            if(!id) {
//                result = null; //'(null id)';
//            }
//            else if(id.isUri()) {
//                result = sponate.extractLabelFromUri(id.getUri());
//            }
//            else if(id.isLiteral()) {
//                result = '' + id.getLiteralValue();
//            }
//            else {
//                result = '' + id;
//            }
//        }
//
//        return result;
//    });
//    var lookupServiceNodeLabels = new service.LookupServiceCache(lookupServiceNodeLabels);
//
//    services.lookupServiceNodeLabels = lookupServiceNodeLabels;
//
//
//    // Init Lookup Service for Path Labels
//    var lookupServicePathLabels = new service.LookupServicePathLabels(lookupServiceNodeLabels);
//
//    services.lookupServicePathLabels = lookupServicePathLabels;
//
//    services.lookupServiceConstraintLabels = new service.LookupServiceConstraintLabels(lookupServiceNodeLabels, lookupServicePathLabels);
//
//
//
//    var sparqlService = new SparqlServiceHttp(serviceUri, defaultGraphUris, ajaxOptions, httpArgs);
//    var result = new SparqlServiceBuilder(sparqlService);
//    return result;
//};
//
//module.exports = SparqlServiceBuilder;
