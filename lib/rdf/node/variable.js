var Node_Fluid = require('./fluid');

var Node_Variable = function() {
    Node_Fluid.call(this);

    this.classLabel = 'Node_Variable';  
};

// inherit
Node_Variable.prototype = Object.create(Node_Fluid.prototype);
// hand back the constructor
Node_Variable.prototype.constructor = Node_Variable;
// change function
Node_Variable.prototype.isVariable = function() {
    return true;
};

module.exports = Node_Fluid;
