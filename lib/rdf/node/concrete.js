var Node = require('./index');

var Node_Concrete = function() {
    Node.call(this);

    this.classLabel = 'Node_Concrete';  
};

// inherit
Node_Concrete.prototype = Object.create(Node.prototype);
// hand back the constructor
Node_Concrete.prototype.constructor = Node_Concrete;
// change function
Node_Concrete.prototype.isConcrete = function() {
    return true;
};

module.exports = Node_Concrete;
