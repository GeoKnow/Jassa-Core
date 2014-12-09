var Class = require('../../ext/Class');
var SparqlService = require('./SparqlService');

var SparqlUpdateBaseString = Class.create(SparqlService, {
    /**
     * Base class for processing query strings.
     */
    createUpdateExecution: function(queryStrOrObj) {
        var result;
        if (Object.toString(queryStrOrObj) === '[object String]') {
            result = this.createUpdateExecutionStr(queryStrOrObj);
        } else {
            result = this.createUpdateExecutionObj(queryStrOrObj);
        }

        return result;
    },

    createUpdateExecutionObj: function(queryObj) {
        var queryStr = queryObj.toString();
        var result = this.createUpdateExecutionStr(queryStr);

        return result;
    },
//    createUpdateExecutionObj: function($super, update) {
//        var str = '' + update;
////        var str = '';
////        updates.forEach(function(update) {
////            if(update) {
////                str += '' + update + '; ';
////            }
////        });
//
//        var result = $super(str);
//        return result;
//    },

    createUpdateExecutionStr: function() { // queryStr) {
        throw new Error('Not implemented');
    },
});

module.exports = SparqlUpdateBaseString;
