var Class = require('../../ext/class');
var SparqlService = require('./sparql-service');

var SparqlServiceBaseString = Class.create(SparqlService, {
    /**
     * Base class for processing query strings.
     */
    createQueryExecution: function(queryStrOrObj) {
        var result;
        if (Object.toString(queryStrOrObj) === '[object String]') {
            result = this.createQueryExecutionStr(queryStrOrObj);
        } else {
            result = this.createQueryExecutionObj(queryStrOrObj);
        }

        return result;
    },

    createQueryExecutionObj: function(queryObj) {
        var queryStr = queryObj.toString();
        var result = this.createQueryExecutionStr(queryStr);

        return result;
    },

    createQueryExecutionStr: function() { // queryStr) {
        throw 'Not implemented';
    },
});

module.exports = SparqlServiceBaseString;
