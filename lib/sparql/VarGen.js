var Class = require('../ext/Class'); 

var NodeFactory = require('../rdf/NodeFactory');

var VarGen = Class.create({
    initialize: function(genSym) {
        this.genSym = genSym;
    },

    next: function() {
        var name = this.genSym.next();
        var result = NodeFactory.createVar(name);
        return result;
    }
});

module.exports = VarGen;
