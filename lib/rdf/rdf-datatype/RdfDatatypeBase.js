var Class = require('../../ext/Class');
var RdfDatatype = require('./RdfDatatype');

// constructor
var RdfDatatypeBase = Class.create(RdfDatatype, {
    classLabel: 'jassa.rdf.RdfDatatypeBase',
    initialize: function(uri) {
        this.uri = uri;
    },
    getUri: function() {
        return this.uri;
    },
});

module.exports = RdfDatatypeBase;
