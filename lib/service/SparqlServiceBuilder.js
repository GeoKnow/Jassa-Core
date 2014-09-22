var Class = require('../ext/Class');


var SparqlServiceHttp = require('./sparql_service/SparqlServiceHttp');
var SparqlServicePaginate = require('./sparql_service/SparqlServicePaginate');
var SparqlServicePageExpand = require('./sparql_service/SparqlServicePageExpand');
var SparqlServiceCache = require('./sparql_service/SparqlServiceCache');
var SparqlServiceVirtFix = require('./sparql_service/SparqlServiceVirtFix');
var SparqlServiceLimit = require('./sparql_service/SparqlServiceLimit');


var SparqlServiceBuilder = Class.create({
    initialize: function(sparqlService) {
        this.sparqlService = sparqlService;
    },

    create: function() {
        return this.sparqlService;
    },

    paginate: function(pageSize) {
        this.sparqlService = new SparqlServicePaginate(this.sparqlService, pageSize);
        return this;
    },

    pageExpand: function(pageSize) {
        this.sparqlService = new SparqlServicePageExpand(this.sparqlService, pageSize);
        return this;
    },

    cache: function(requestCache) {
        this.sparqlService = new SparqlServiceCache(this.sparqlService, requestCache);
        return this;
    },

    virtFix: function() {
        this.sparqlService = new SparqlServiceVirtFix(this.sparqlService);
        return this;
    },

    limit: function(limit) {
        this.sparqlService = new SparqlServiceLimit(this.sparqlService, limit);
    },


//    delay: function() {
//        // does not exist yet
//    },
//    failover: function() {
//
//    },

});

// var sparqlService = SparqlServiceBuilder.http().limit(100000).virtFix().cache().paginate(1000).pageExpand(100).create();
SparqlServiceBuilder.http = function(serviceUri, defaultGraphUris, ajaxOptions, httpArgs) {
    var sparqlService = new SparqlServiceHttp(serviceUri, defaultGraphUris, ajaxOptions, httpArgs);
    var result = new SparqlServiceBuilder(sparqlService);
    return result;
};

module.exports = SparqlServiceBuilder;
