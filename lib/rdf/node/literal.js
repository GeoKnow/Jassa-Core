var Node_Concrete = require('./concrete');

var Node_Literal = function(literalLabel) {
    Node_Concrete.call(this);

    this.classLabel = 'Node_Literal';

    // init
    this.initialize(literalLabel);
};

// inherit
Node_Literal.prototype = Object.create(Node_Concrete.prototype);
// hand back the constructor
Node_Literal.prototype.constructor = Node_Literal;
// assign new functions
Node_Literal.prototype.initialize = function(literalLabel) {
    this.literalLabel = literalLabel;
};
Node_Literal.prototype.isLiteral = function() {
    return true;
};
Node_Literal.prototype.getLiteral = function() {
    return this.literalLabel;
};
Node_Literal.prototype.getLiteralValue = function() {
    return this.literalLabel.getValue();
};
Node_Literal.prototype.getLiteralLexicalForm = function() {
    return this.literalLabel.getLexicalForm();
};
Node_Literal.prototype.getLiteralDatatype = function() {
    return this.literalLabel.getDatatype();
};
Node_Literal.prototype.getLiteralDatatypeUri = function() {
    var dtype = this.getLiteralDatatype();
    var result = dtype ? dtype.getUri() : null;
    return result;
};
Node_Literal.prototype.getLiteralLanguage = function() {
    return this.literalLabel.getLanguage();
};
Node_Literal.prototype.toString = function() {
    return this.literalLabel.toString();
};


module.exports = Node_Literal;
