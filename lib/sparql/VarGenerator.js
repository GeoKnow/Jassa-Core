var Class = require('../ext/Class');
var NodeFactory = require('../rdf/NodeFactory');

var VarGenerator = Class.create({
    initialize: function(generator) {
        this.generator = generator;
    },
    next: function() {
        var varName = this.generator.next();

        var result = NodeFactory.createVar(varName);

        return result;
    },
});

module.exports = VarGenerator;
