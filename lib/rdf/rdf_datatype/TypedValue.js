var Class = require('../../ext/Class');
// constructor
var TypedValue = Class.create({
    classLabel: 'jassa.rdf.TypedValue',
    initialize: function(lexicalValue, datatypeUri) {
        this.lexicalValue = lexicalValue;
        this.datatypeUri = datatypeUri;
    },
    getLexicalValue: function() {
        return this.lexicalValue;
    },
    getDatatypeUri: function() {
        return this.datatypeUri;
    },
});

module.exports = TypedValue;
