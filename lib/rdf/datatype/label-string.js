var DatatypeLabel = require('./label');

// constructor
var DatatypeLabelString = function() {
    DatatypeLabel.call(this);

    this.classLabel = 'DatatypeLabelString';
};
// inherit
DatatypeLabelString.prototype = Object.create(DatatypeLabel.prototype);
// hand back the constructor
DatatypeLabelString.prototype.constructor = DatatypeLabelString;
// assign new functions
DatatypeLabelString.prototype.parse = function(str) {
    return str;
};
DatatypeLabelString.prototype.unparse = function(val) {
    return '' + val;
};

module.exports = DatatypeLabelString;
