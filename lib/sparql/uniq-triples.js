var uniq = require('lodash.uniq');

var uniqTriples = function(triples) {
    var result =  uniq(triples, false, function(x) {
        return x.toString();
    });
    return result;
};

module.exports = uniqTriples;
