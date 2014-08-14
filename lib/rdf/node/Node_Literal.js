var Class = require('../../ext/Class');
var Node_Concrete = require('./Node_Concrete');

var Node_Literal = Class.create(Node_Concrete, {
    classLabel: 'Node_Literal',
    initialize: function(literalLabel) {
        this.literalLabel = literalLabel;
    },
    isLiteral: function() {
        return true;
    },
    getLiteral: function() {
        return this.literalLabel;
    },
    getLiteralValue: function() {
        return this.literalLabel.getValue();
    },
    getLiteralLexicalForm: function() {
        return this.literalLabel.getLexicalForm();
    },
    getLiteralDatatype: function() {
        return this.literalLabel.getDatatype();
    },
    getLiteralDatatypeUri: function() {
        var dtype = this.getLiteralDatatype();
        var result = dtype ? dtype.getUri() : null;
        return result;
    },
    getLiteralLanguage: function() {
        return this.literalLabel.getLanguage();
    },
    toString: function() {
        return this.literalLabel.toString();
    },
});

module.exports = Node_Literal;
