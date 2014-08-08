var Class = require('../ext/class');
var NodeFactory = require('../rdf/node-factory');

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