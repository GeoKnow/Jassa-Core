var NodeFactory = require('../rdf/node-factory');

var VarGenerator = function(generator) {
    this.initialize(generator);
};

VarGenerator.prototype.initialize = function(generator) {
    this.generator = generator;
};

VarGenerator.prototype.next = function() {
    var varName = this.generator.next();
    
    var result = NodeFactory.createVar(varName);
    
    return result;
};

module.exports = VarGenerator;
