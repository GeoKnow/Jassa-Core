var uniq = require('lodash.uniq');
var StringUtils = {
        var extractAll = function(pattern, str, index) {
            // Extract variables from the fragment
            var match;
            var result = [];

            while ((match = pattern.exec(str)) !== null) {
                result.push(match[index]);
            }

            result = uniq(result);

            return result;

        };
        
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

};

module.exports = StringUtils;