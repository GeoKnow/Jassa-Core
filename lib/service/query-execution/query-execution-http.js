var QueryExecution = require('./query-execution');
var ServiceUtils = require('./service-utils');

var QueryExecutionHttp = function(queryString, serviceUri, defaultGraphUris, ajaxOptions, httpArgs) {
    QueryExecution.call(this);

    this.initialize(queryString, serviceUri, defaultGraphUris, ajaxOptions, httpArgs);
};
// inherit
QueryExecutionHttp.prototype = Object.create(QueryExecution.prototype);
// hand back the constructor
QueryExecutionHttp.prototype.constructor = QueryExecutionHttp;



QueryExecutionHttp.prototype.initialize = function(queryString, serviceUri, defaultGraphUris, ajaxOptions, httpArgs) {
    this.queryString = queryString;
    this.serviceUri = serviceUri;
    this.defaultGraphUris = defaultGraphUris;

    this.ajaxOptions = ajaxOptions || {};
    this.httpArgs = httpArgs;
};

/**
 *
 * @returns {Promise<sparql.ResultSet>}
 */
QueryExecutionHttp.prototype.execSelect = function() {
    var result = this.execAny().pipe(ServiceUtils.jsonToResultSet);
    return result;
};

QueryExecutionHttp.prototype.execAsk = function() {
    var result = this.execAny().pipe(function(json) {
        return json.boolean;
    });

    return result;
};

// Returns an iterator of triples
QueryExecutionHttp.prototype.execConstructTriples = function() {
    throw 'Not implemented yet';
    //return this.execAny(queryString);
};

QueryExecutionHttp.prototype.execDescribeTriples = function() {
    throw 'Not implemented yet';
    //return this.execAny(queryString);
};

QueryExecutionHttp.prototype.setTimeout = function(timeoutInMillis) {
    this.ajaxOptions.timeout = timeoutInMillis;
};

QueryExecutionHttp.prototype.getTimeout = function() {
    return this.ajaxOptions.timeout;
};

QueryExecutionHttp.prototype.execAny = function() {

    var ajaxSpec = ServiceUtils.createSparqlRequestAjaxSpec(this.serviceUri, this.defaultGraphUris, this.queryString, this.httpArgs, this.ajaxOptions);
    var result = $.ajax(ajaxSpec);

    return result;
};

module.exports = QueryExecutionHttp;