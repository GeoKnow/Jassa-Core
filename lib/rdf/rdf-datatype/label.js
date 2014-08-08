var Class = require('../../ext/class');
var RdfDatatypeBase = require('./base');

// constructor
var RdfDatatype_Label = Class.create(RdfDatatypeBase, {
    classLabel: 'RdfDatatype_Label',
    initialize: function($super, uri, datatypeLabel) {
        $super(uri);

        this.datatypeLabel = datatypeLabel;
    },
    parse: function(str) {
        return this.datatypeLabel.parse(str);
    },
    unparse: function(val) {
        return this.datatypeLabel.unparse(val);
    },
});

module.exports = RdfDatatype_Label;