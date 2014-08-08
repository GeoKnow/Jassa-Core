var Class = require('../../ext/class');
var defaults = require('lodash.defaults');
var SparqlServiceBaseString = require('./sparql-service-base-string');
var QueryExecutionHttp = require('../query-execution').Http;
var JSONCanonical = require('../../ext/json-canonical');

var SparqlServiceHttp = Class.create(SparqlServiceBaseString, {
    initialize: function($, serviceUri, defaultGraphUris, ajaxOptions, httpArgs) {
        this.$ = $;
        this.serviceUri = serviceUri;
        this.defaultGraphUris = defaultGraphUris;
        //this.setDefaultGraphs(defaultGraphUris);

        this.ajaxOptions = ajaxOptions;
        this.httpArgs = httpArgs;
    },

    getServiceId: function() {
        return this.serviceUri;
    },

    /**
     * This method is intended to be used by caches,
     *
     * A service is not assumed to return the same result for
     * a query if this method returned different hashes.
     *
     * The state hash does not include the serviceId
     *
     */
    getStateHash: function() {
        var result = JSONCanonical.stringify(this.defaultGraphUris);
        result += JSONCanonical.stringify(this.httpArgs);
        return result;
    },

    hashCode: function() {
        return this.getServiceId() + '/' + this.getStateHash();
    },

    setDefaultGraphs: function(uriStrs) {
        this.defaultGraphUris = uriStrs; // ? uriStrs : [];
    },

    getDefaultGraphs: function() {
        return this.defaultGraphUris;
    },

    createQueryExecutionStr: function(queryStr) {
        var ajaxOptions = defaults({}, this.ajaxOptions);

        var result = new QueryExecutionHttp(this.$, queryStr, this.serviceUri, this.defaultGraphUris, ajaxOptions, this.httpArgs);
        return result;
    },

    createQueryExecutionObj: function(query) {
        if (true) {
            if (query.flatten) {
                var before = query;
                query = before.flatten();
            }
        }

        var result = SparqlServiceBaseString.prototype.createQueryExecutionObj.call(this, query);
        return result;
    },
});

module.exports = SparqlServiceHttp;