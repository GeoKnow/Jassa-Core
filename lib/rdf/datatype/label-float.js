var DatatypeLabel = require('./label');

// constructor
var DatatypeLabelFloat = function() {
    DatatypeLabel.call(this);

    this.classLabel = 'DatatypeLabelFloat';
};
// inherit
DatatypeLabelFloat.prototype = Object.create(DatatypeLabel.prototype);
// hand back the constructor
DatatypeLabelFloat.prototype.constructor = DatatypeLabelFloat;
// assign new functions
DatatypeLabelFloat.prototype.parse = function(str) {
    return parseFloat(str);
};
DatatypeLabelFloat.prototype.unparse = function(val) {
    return '' + val;
};

module.exports = DatatypeLabelFloat;
