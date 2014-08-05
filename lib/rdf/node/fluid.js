var Node = require('./index');

var Node_Fluid = function() {
    Node.call(this);

    this.classLabel = 'Node_Fluid';  
};

// inherit
Node_Fluid.prototype = Object.create(Node.prototype);
// hand back the constructor
Node_Fluid.prototype.constructor = Node_Fluid;
// change function
Node_Fluid.prototype.isConcrete = function() {
    return false;
};

module.exports = Node_Fluid;
