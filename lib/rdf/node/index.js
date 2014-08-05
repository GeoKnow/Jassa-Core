/**
 * The node base class similar to that of Apache Jena.
 *
 * TODO Rename getUri to getURI
 * TODO Make this class a pure interface - move all impled methods to an abstract base class
 * TODO Clarify who is responsible for .equals() (just do it like in Jena - Is it the base class or its derivations?)
 */
var Node = function() {
    this.classLabel = 'Node';
};

Node.prototype.getUri = function() {
    throw 'not a URI node';
};

Node.prototype.getName = function() {
    throw ' is not a variable node';
};

Node.prototype.getBlankNodeId = function() {
    throw ' is not a blank node';
};

Node.prototype.getBlankNodeLabel = function() {
    // Convenience override
    return this.getBlankNodeId().getLabelString();
};

Node.prototype.getLiteral = function() {
    throw ' is not a literal node';
};

Node.prototype.getLiteralValue = function() {
    throw ' is not a literal node';
};

Node.prototype.getLiteralLexicalForm = function() {
    throw ' is not a literal node';
};

Node.prototype.getLiteralDatatype = function() {
    throw ' is not a literal node';
};

Node.prototype.getLiteralDatatypeUri = function() {
    throw ' is not a literal node';
};

Node.prototype.isBlank = function() {
    return false;
};

Node.prototype.isUri = function() {
    return false;
};

Node.prototype.isLiteral = function() {
    return false;
};

Node.prototype.isVariable = function() {
    return false;
};

Node.prototype.equals = function(that) {
    // By default we assume non-equality
    var result = false;

    if (that === null) {
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
        throw 'not implemented yet';
    }

    return result;
};

module.exports = Node;
