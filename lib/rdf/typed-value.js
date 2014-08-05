// constructor
var TypedValue = function(lexicalValue, datatypeUri) {
    this.classLabel = 'TypedValue';

    // init
    this.initialize(lexicalValue, datatypeUri);
};
TypedValue.prototype.initialize = function(lexicalValue, datatypeUri) {
    this.lexicalValue = lexicalValue;
    this.datatypeUri = datatypeUri;
};
TypedValue.prototype.getLexicalValue = function() {
    return this.lexicalValue;
};
TypedValue.prototype.getDatatypeUri = function() {
    return this.datatypeUri;
};

module.exports = TypedValue;
