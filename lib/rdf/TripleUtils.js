var uniq = require('lodash.uniq');


var TripleUtils = {
    uniqTriples: function(triples) {
        var result =  uniq(triples, false, function(x) {
            return x.toString();
        });
        return result;
    },

    getNodeAt: function(triple, index) {
        if(triple == null) {
            index = null;
        }

        var result;
        switch(index) {
        case 0: result = triple.getSubject(); break;
        case 1: result = triple.getPredicate(); break;
        case 2: result = triple.getObject(); break;
        default:
            result = null;
        }

        return result;
    },
};

module.exports = TripleUtils;
