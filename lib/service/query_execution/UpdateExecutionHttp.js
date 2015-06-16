/* jshint maxparams: 7 */
var Class = require('../../ext/Class');
//var UpdateExecution = require('./UpdateExecution');
var AjaxUtils = require('../AjaxUtils');

var shared = require('../../util/shared');
var ajax = shared.ajax;
var Promise = shared.Promise;


var UpdateExecutionHttp = Class.create({
    /**
     *
     * @param httpClient a function that takes a request specification and returns a corresponding promise
     */
    initialize: function(queryString, serviceUri, usingGraphUris, usingNamedGraphUris, ajaxOptions, httpArgs, httpClient) {
        this.queryString = queryString;
        this.serviceUri = serviceUri;
        this.usingGraphUris = usingGraphUris;
        this.usingNamedGraphUris = usingNamedGraphUris;

        this.ajaxOptions = ajaxOptions || {};
        this.httpArgs = httpArgs;
        this.httpClient = httpClient || ajax;
    },

    /**
     *
     * @returns {Promise<sparql.ResultSet>}
     */
    execUpdate: function() {
        var result = this.execAny();
        return result;
    },

    setTimeout: function(timeoutInMillis) {
        this.ajaxOptions.timeout = timeoutInMillis;
    },

    getTimeout: function() {
        return this.ajaxOptions.timeout;
    },

    execAny: function() {
        var ajaxSpec = AjaxUtils.createSparqlUpdateAjaxSpec(this.queryString, this.serviceUri, this.usingGraphUris, this.usingNamedGraphUris, this.httpArgs, this.ajaxOptions);
        //console.log('Update spec: ', JSON.stringify(ajaxSpec, null, 4));
        var result = this.httpClient(ajaxSpec);
        return result;
    },
});

module.exports = UpdateExecutionHttp;
