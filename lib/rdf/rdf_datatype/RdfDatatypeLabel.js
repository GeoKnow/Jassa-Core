/* jscs:null requireCamelCaseOrUpperCaseIdentifiers */
var Class = require('../../ext/Class');
var RdfDatatypeBase = require('./RdfDatatypeBase');

// constructor
var RdfDatatypeLabel = Class.create(RdfDatatypeBase, {
    classLabel: 'jassa.rdf.RdfDatatype_Label',
    initialize: function($super, uri, datatypeLabel) {
        $super(uri);

        this.datatypeLabel = datatypeLabel;
    },
    parse: function(str) {
        return this.datatypeLabel.parse(str);
    },
    unparse: function(val) {
        return this.datatypeLabel.unparse(val);
    }
});

module.exports = RdfDatatypeLabel;
