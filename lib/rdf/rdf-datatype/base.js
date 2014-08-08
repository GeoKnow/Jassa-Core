var Class = require('../../ext/class');
var RdfDatatype = require('./index');

// constructor
var RdfDatatypeBase = Class.create(RdfDatatype, {
    classLabel: 'RdfDatatypeBase',
    initialize: function(uri) {
        this.uri = uri;
    },
    getUri: function() {
        return this.uri;
    },
});

module.exports = RdfDatatypeBase;