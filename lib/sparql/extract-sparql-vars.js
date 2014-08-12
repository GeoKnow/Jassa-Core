var NodeFactory = require('../rdf/node-factory');
var extractAll = require('./extract-all');

var varPattern = /\?(\w+)/g;

/**
 * Extract SPARQL variables from a string
 *
 * @param {String} str
 * @returns {Array}
 */
var extractSparqlVars = function(str) {
    var varNames = extractAll(varPattern, str, 1);
    var result = [];
    for (var i = 0; i < varNames.length; ++i) {
        var varName = varNames[i];
        var v = NodeFactory.createVar(varName);
        result.push(v);
    }

    return result;
};

module.exports = extractSparqlVars;
