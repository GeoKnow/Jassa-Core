var Node_Concrete = require('./concrete');

var Node_Blank = function(anonId) {
    Node_Concrete.call(this);

    this.classLabel = 'Node_Blank';

    // init
    this.initialize(anonId);
};

// inherit
Node_Blank.prototype = Object.create(Node_Concrete.prototype);
// hand back the constructor
Node_Blank.prototype.constructor = Node_Blank;

// change functions
// Note: id is expected to be an instance of AnonId
Node_Blank.prototype.initialize = function(anonId) {
    this.anonId = anonId;
};

Node_Blank.prototype.isBlank = function() {
    return true;
};

Node_Blank.prototype.getBlankNodeId = function() {
    return this.anonId;
};

Node_Blank.prototype.toString = function() {
    return '_:' + this.anonId;
};

module.exports = Node_Concrete;
