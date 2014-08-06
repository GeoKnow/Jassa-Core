var uniq = require('lodash.uniq');

var extractAll = function(pattern, str, index) {
    // Extract variables from the fragment  
    var match;
    var result = [];
    
    while (match = pattern.exec(str)) {
        result.push(match[index]);
    }
    
    result = uniq(result);
    
    return result;
    
};

module.exports = extractAll;