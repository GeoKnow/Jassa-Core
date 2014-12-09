var Class = require('../../ext/Class');
var defaults = require('lodash.defaults');
var SparqlUpdateBaseString = require('./SparqlUpdateBaseString');
var UpdateExecutionHttp = require('../query_execution/UpdateExecutionHttp');
var JSONCanonical = require('../../ext/JSONCanonical');

var SparqlUpdateHttp = Class.create(SparqlUpdateBaseString, {
    initialize: function(serviceUri, usingGraphUris, usingNamedGraphUris, ajaxOptions, httpArgs) {
        this.serviceUri = serviceUri;
        this.usingGraphUris = usingGraphUris;
        this.usingNamedGraphUris = usingNamedGraphUris;

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
        var result = 'using:' + JSONCanonical.stringify(this.usingGraphUris);
        result += 'usingNamed:' + JSONCanonical.stringify(this.usingNamedGraphUris);
        result += JSONCanonical.stringify(this.httpArgs);
        return result;
    },

    hashCode: function() {
        return this.getServiceId() + '/' + this.getStateHash();
    },

//    setDefaultGraphs: function(uriStrs) {
//        this.defaultGraphUris = uriStrs; // ? uriStrs : [];
//    },

    createUpdateExecutionStr: function(queryStr) {
        var ajaxOptions = defaults({}, this.ajaxOptions);

        var result = new UpdateExecutionHttp(queryStr, this.serviceUri, this.usingGraphUris, this.usingNamedGraphUris, ajaxOptions, this.httpArgs);
        return result;
    }
});

module.exports = SparqlUpdateHttp;
