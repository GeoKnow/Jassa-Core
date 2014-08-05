var Node_Variable = require('./node/variable');

var Var = function(name) {
    Node_Variable.call(this);

    this.classLabel = 'Var';

    // init
    this.initialize(name);  
};

// inherit
Var.prototype = Object.create(Node_Variable.prototype);
// hand back the constructor
Var.prototype.constructor = Var;
// change functions
Var.prototype.initialize = function(name) {
    this.name = name;
};
Var.prototype.getName = function() {
    return this.name;
};
Var.prototype.toString = function() {
    return '?' + this.name;
};

module.exports = Var;
