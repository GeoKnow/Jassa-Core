var Node_Concrete = require('./concrete');

var Node_Uri = function(uri) {
    Node_Concrete.call(this);

    this.classLabel = 'Node_Uri';

    // init
    this.initialize(uri);
};

// inherit
Node_Uri.prototype = Object.create(Node_Concrete.prototype);
// hand back the constructor
Node_Uri.prototype.constructor = Node_Uri;

// override functions
Node_Uri.prototype.initialize = function(uri) {
    this.uri = uri;
};
Node_Uri.prototype.isUri = function() {
    return true;
};
Node_Uri.prototype.getUri = function() {
    return this.uri;
};
Node_Uri.prototype.toString = function() {
    return '<' + this.uri + '>';
};

module.exports = Node_Uri;