// constructor
var AnonId = function() {
    this.classLabel = 'AnonId';
};
// hand back the constructor
AnonId.prototype.getLabelString = function() {
    throw 'not implemented';
};

module.exports = AnonId;
