var SparqlService = require('./sparql-service');

var SparqlServiceBaseString = function(queryStrOrObj) {
    SparqlService.call(this);

    this.initialize(queryStrOrObj);
};
// inherit
SparqlServiceBaseString.prototype = Object.create(SparqlService.prototype);
// hand back the constructor
SparqlServiceBaseString.prototype.constructor = SparqlServiceBaseString;

/**
 * Base class for processing query strings.
 */
SparqlServiceBaseString.prototype.createQueryExecution = function(queryStrOrObj) {
    var result;
    if (Object.toString(queryStrOrObj) === '[object String]') {
        result = this.createQueryExecutionStr(queryStrOrObj);
    } else {
        result = this.createQueryExecutionObj(queryStrOrObj);
    }

    return result;
};

SparqlServiceBaseString.prototype.createQueryExecutionObj = function(queryObj) {
    var queryStr = '' + queryObj;
    var result = this.createQueryExecutionStr(queryStr);

    return result;
};

SparqlServiceBaseString.prototype.createQueryExecutionStr = function(queryStr) {
    throw 'Not implemented';
};

module.exports = SparqlServiceBaseString;
