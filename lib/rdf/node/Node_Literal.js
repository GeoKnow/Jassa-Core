var Class = require('../../ext/Class');
var Node_Concrete = require('./Node_Concrete');

var ObjectUtils = require('../../util/ObjectUtils');

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
    hashCode: function() {
        if(this.hash == null) {
            this.hash =
                ObjectUtils.hashCodeStr(this.getLiteralLexicalForm()) +
                3 * ObjectUtils.hashCodeStr(this.getLiteralDatatypeUri()) +
                7 * ObjectUtils.hashCodeStr(this.getLiteralLanguage());
        }

        return this.hash;
    },
    equals: function(that) {
        var result =
            that != null &&
            that.isLiteral != null &&
            that.isLiteral() &&
            this.getLiteralLexicalForm() === that.getLiteralLexicalForm() &&
            this.getLiteralDatatypeUri() === that.getLiteralDatatypeUri() &&
            this.getLiteralLanguage() === that.getLiteralLanguage();

        return result;
    },
    toString: function() {
        return this.literalLabel.toString();
    }
});

module.exports = Node_Literal;
