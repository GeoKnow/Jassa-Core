/* jshint maxparams: 6 */
var Class = require('../../ext/Class');
var QueryExecution = require('./query-execution');
var ServiceUtils = require('../service-utils');
var shared = require('../../util/shared');
var ajax = shared.ajax;

var QueryExecutionHttp = Class.create(QueryExecution, {
    initialize: function(queryString, serviceUri, defaultGraphUris, ajaxOptions, httpArgs) {
        this.queryString = queryString;
        this.serviceUri = serviceUri;
        this.defaultGraphUris = defaultGraphUris;

        this.ajaxOptions = ajaxOptions || {};
        this.httpArgs = httpArgs;
    },

    /**
     *
     * @returns {Promise<sparql.ResultSet>}
     */
    execSelect: function() {
        var result = this.execAny().then(ServiceUtils.jsonToResultSet);
        return result;
    },

    execAsk: function() {
        var result = this.execAny().then(function(json) {
            return json.boolean;
        });

        return result;
    },

    // Returns an iterator of triples
    execConstructTriples: function() {
        throw 'Not implemented yet';
        // return this.execAny(queryString);
    },

    execDescribeTriples: function() {
        throw 'Not implemented yet';
        // return this.execAny(queryString);
    },

    setTimeout: function(timeoutInMillis) {
        this.ajaxOptions.timeout = timeoutInMillis;
    },

    getTimeout: function() {
        return this.ajaxOptions.timeout;
    },

    execAny: function() {
        var ajaxSpec = ServiceUtils.createSparqlRequestAjaxSpec(this.serviceUri, this.defaultGraphUris, this.queryString, this.httpArgs, this.ajaxOptions);
        var result = ajax(ajaxSpec);

        return result;
    },
});

module.exports = QueryExecutionHttp;
