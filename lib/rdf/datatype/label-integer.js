var DatatypeLabel = require('./label');

// constructor
var DatatypeLabelInteger = function() {
    DatatypeLabel.call(this);

    this.classLabel = 'DatatypeLabelInteger';
};
// inherit
DatatypeLabelInteger.prototype = Object.create(DatatypeLabel.prototype);
// hand back the constructor
DatatypeLabelInteger.prototype.constructor = DatatypeLabelInteger;
// assign new functions
DatatypeLabelInteger.prototype.parse = function(str) {
    return parseInt(str, 10);
};
DatatypeLabelInteger.prototype.unparse = function(val) {
    return '' + val;
};

module.exports = DatatypeLabelInteger;

