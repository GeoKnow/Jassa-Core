var uniq = require('lodash.uniq');

var StringUtils = {

    extractAllRegexMatches: function(pattern, str, index) {
        var match;
        var result = [];

        while ((match = pattern.exec(str)) != null) {
            result.push(match[index]);
        }

        result = uniq(result);

        return result;
    }

};

module.exports = StringUtils;
