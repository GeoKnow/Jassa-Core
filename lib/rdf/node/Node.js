var Class = require('../../ext/Class');
/**
 * The node base class similar to that of Apache Jena.
 *
 * TODO Rename getUri to getURI
 * TODO Make this class a pure interface - move all impled methods to an abstract base class
 * TODO Clarify who is responsible for .equals() (just do it like in Jena - Is it the base class or its derivations?)
 */
var Node = Class.create({
    classLabel: 'Node',

    getUri: function() {
        throw new Error('not a URI node');
    },

    getName: function() {
        throw new Error('is not a variable node');
    },

    getBlankNodeId: function() {
        throw new Error('is not a blank node');
    },

    getBlankNodeLabel: function() {
        // Convenience override
        return this.getBlankNodeId().getLabelString();
    },

    getLiteral: function() {
        throw new Error('is not a literal node');
    },

    getLiteralValue: function() {
        throw new Error('is not a literal node');
    },

    getLiteralLexicalForm: function() {
        throw new Error('is not a literal node');
    },

    getLiteralDatatype: function() {
        throw new Error('is not a literal node');
    },

    getLiteralDatatypeUri: function() {
        throw new Error('is not a literal node');
    },

    isBlank: function() {
        return false;
    },

    isUri: function() {
        return false;
    },

    isLiteral: function() {
        return false;
    },

    isVariable: function() {
        return false;
    },

    equals: function(that) {
        // By default we assume non-equality
        var result = false;

        if (that == null) {
            result = false;

        } else if (this.isLiteral()) {
            if (that.isLiteral()) {
                var isSameLex = this.getLiteralLexicalForm() === that.getLiteralLexicalForm();
                var isSameType = this.getLiteralDatatypeUri() === that.getLiteralDatatypeUri();
                var isSameLang = this.getLiteralLanguage() === that.getLiteralLanguage();

                result = isSameLex && isSameType && isSameLang;
            }

        } else if (this.isUri()) {
            if (that.isUri()) {
                result = this.getUri() === that.getUri();
            }

        } else if (this.isVariable()) {
            if (that.isVariable()) {
                result = this.getName() === that.getName();
            }

        } else if (this.isBlank()) {
            if (that.isBlank()) {
                result = this.getBlankNodeLabel() === that.getBlankNodeLabel();
            }

        } else {
            throw new Error('not implemented yet');
        }

        return result;
    }
});

module.exports = Node;
