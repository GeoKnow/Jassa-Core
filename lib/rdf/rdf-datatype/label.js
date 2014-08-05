var RdfDatatypeBase = require('./base');

// constructor
var RdfDatatype_Label = function($super, uri, datatypeLabel) {
    RdfDatatypeBase.call(this);

    this.classLabel = 'RdfDatatype_Label';

    // init
    this.initialize(uri, datatypeLabel);
};
// inherit
RdfDatatype_Label.prototype = Object.create(RdfDatatypeBase.prototype);
// hand back the constructor
RdfDatatype_Label.prototype.constructor = RdfDatatype_Label;
// assign new functions
RdfDatatype_Label.prototype.initialize = function(uri, datatypeLabel) {
    this.uri = uri;
    this.datatypeLabel = datatypeLabel;
};
RdfDatatype_Label.prototype.parse = function(str) {
    return this.datatypeLabel.parse(str);
};
RdfDatatype_Label.prototype.unparse = function(val) {
    return this.datatypeLabel.unparse(val);
};

module.exports = RdfDatatype_Label;

