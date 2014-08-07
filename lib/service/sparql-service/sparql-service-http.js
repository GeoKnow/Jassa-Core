var defaults = require('lodash.defaults');
var SparqlServiceBaseString = require('./sparql-service-base-string');
var QueryExecutionHttp = require('../query-execution').Http;
var JSONCanonical = require('../../ext/json-canonical');

var SparqlServiceHttp = function($, serviceUri, defaultGraphUris, ajaxOptions, httpArgs) {
    SparqlServiceBaseString.call(this);

    this.initialize($, serviceUri, defaultGraphUris, ajaxOptions, httpArgs);
};
// inherit
SparqlServiceHttp.prototype = Object.create(SparqlServiceBaseString.prototype);
// hand back the constructor
SparqlServiceHttp.prototype.constructor = SparqlServiceHttp;


SparqlServiceHttp.prototype.initialize = function($, serviceUri, defaultGraphUris, ajaxOptions, httpArgs) {
    this.$ = $;
    this.serviceUri = serviceUri;
    this.defaultGraphUris = defaultGraphUris;
    //this.setDefaultGraphs(defaultGraphUris);

    this.ajaxOptions = ajaxOptions;
    this.httpArgs = httpArgs;
};

SparqlServiceHttp.prototype.getServiceId = function() {
    return this.serviceUri;
};

/**
 * This method is intended to be used by caches,
 *
 * A service is not assumed to return the same result for
 * a query if this method returned different hashes.
 *
 * The state hash does not include the serviceId
 *
 */
SparqlServiceHttp.prototype.getStateHash = function() {
    var result = JSONCanonical.stringify(this.defaultGraphUris);
    result += JSONCanonical.stringify(this.httpArgs);
    return result;
};

SparqlServiceHttp.prototype.hashCode = function() {
    return this.getServiceId() + '/' + this.getStateHash();
};

SparqlServiceHttp.prototype.setDefaultGraphs = function(uriStrs) {
    this.defaultGraphUris = uriStrs; // ? uriStrs : [];
};

SparqlServiceHttp.prototype.getDefaultGraphs = function() {
    return this.defaultGraphUris;
};

SparqlServiceHttp.prototype.createQueryExecutionStr = function(queryStr) {
    var ajaxOptions = defaults({}, this.ajaxOptions);

    var result = new QueryExecutionHttp(this.$, queryStr, this.serviceUri, this.defaultGraphUris, ajaxOptions, this.httpArgs);
    return result;
};

SparqlServiceHttp.prototype.createQueryExecutionObj = function(query) {
    if (true) {
        if (query.flatten) {
            var before = query;
            query = before.flatten();
        }
    }

    var result = SparqlServiceBaseString.prototype.createQueryExecutionObj.call(this, query);
    return result;
};

module.exports = SparqlServiceHttp;
