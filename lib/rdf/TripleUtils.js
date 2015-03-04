var uniq = require('lodash.uniq');

var NodeUtils = require('./NodeUtils');

var TripleUtils = {
    uniqTriples: function(triples) {
        var result =  uniq(triples, false, function(x) {
            return x.toString();
        });
        return result;
    },

    matches: function(tripleMatch, triple) {
        var ps = tripleMatch.toArray();
        var cs = triple.toArray();

        var result = true;
        for(var i = 0; i < 3; ++i) {
            var p = ps[i];
            var c = cs[i];

            var t = NodeUtils.matches(p, c);
            if(!t) {
                result = false;
                break;
            }
        }

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
