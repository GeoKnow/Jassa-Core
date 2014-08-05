var AnonId = require('./anon-id');

// constructor
var AnonIdStr = function(label) {
    AnonId.call(this);

    this.classLabel = 'AnonIdStr';

    // init
    this.initialize(label);
};
// inherit
AnonIdStr.prototype = Object.create(AnonId.prototype);
// hand back the constructor
AnonIdStr.prototype.constructor = AnonIdStr;
// assign new functions
AnonIdStr.prototype.initialize = function(label) {
    this.label = label;
};
AnonIdStr.prototype.getLabelString = function() {
    return this.label;
};
AnonIdStr.prototype.toString = function() {
    return this.label;
};

module.exports = AnonIdStr;
