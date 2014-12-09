/* jshint maxparams: 6 */
var Class = require('../../ext/Class');
//var UpdateExecution = require('./UpdateExecution');
var AjaxUtils = require('../AjaxUtils');

var shared = require('../../util/shared');
var ajax = shared.ajax;
var Promise = shared.Promise;

var UpdateExecutionHttp = Class.create({
    initialize: function(queryString, serviceUri, usingGraphUris, usingNamedGraphUris, ajaxOptions, httpArgs) {
        this.queryString = queryString;
        this.serviceUri = serviceUri;
        this.usingGraphUris = usingGraphUris;
        this.usingNamedGraphUris = usingNamedGraphUris;

        this.ajaxOptions = ajaxOptions || {};
        this.httpArgs = httpArgs;
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
        var result = ajax(ajaxSpec);
        return result;
    },
});

module.exports = UpdateExecutionHttp;
