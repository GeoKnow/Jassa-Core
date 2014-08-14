var TripleUtils = {
    uniqTriples = function(triples) {
        var result =  uniq(triples, false, function(x) {
            return x.toString();
        });
        return result;
    }
};

module.exports = TripleUtils;
