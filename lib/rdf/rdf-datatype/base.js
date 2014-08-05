var RdfDatatype = require('./index');

// constructor
var RdfDatatypeBase = function(uri) {
    RdfDatatype.call(this);

    this.classLabel = 'RdfDatatypeBase';

    // init
    this.initialize(uri);
};
// inherit
RdfDatatypeBase.prototype = Object.create(RdfDatatype.prototype);
// hand back the constructor
RdfDatatypeBase.prototype.constructor = RdfDatatypeBase;
// assign new functions
RdfDatatypeBase.prototype.initialize = function(uri) {
    this.uri = uri;
};
RdfDatatypeBase.prototype.getUri = function() {
    return this.uri;
};

module.exports = RdfDatatypeBase;
