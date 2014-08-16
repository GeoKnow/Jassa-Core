var VarGen = Class.create({
    initialize: function(genSym) {
        this.genSym = genSym;
    },

    next: function() {
        var name = genSym.next();
        var result = rdf.NodeFactory.createVar(name);
        return result;
    }
});
