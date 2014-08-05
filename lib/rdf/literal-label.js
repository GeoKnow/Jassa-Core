var Node_Concrete = require('./node/concrete');

// constructor
var LiteralLabel = function(val, lex, lang, dtype) {
    Node_Concrete.call(this);

    this.classLabel = 'LiteralLabel';

    // init
    this.initialize(val, lex, lang, dtype);
};
// inherit
LiteralLabel.prototype = Object.create(Node_Concrete.prototype);
// hand back the constructor
LiteralLabel.prototype.constructor = LiteralLabel;

// helper function
// FIXME: WAT?
var escapeLiteralString = function(str) {
    return str;
};

// assign new functions

/**
 * Note: The following should hold:
 * dtype.parse(lex) == val
 * dtype.unpars(val) == lex
 *
 * However, this class doesn't care about it.
 */
LiteralLabel.prototype.initialize = function(val, lex, lang, dtype) {
    this.val = val;
    this.lex = lex;
    this.lang = lang;
    this.dtype = dtype;
};
/** Get the literal's value as a JavaScript object */
LiteralLabel.prototype.getValue = function() {
    return this.val;
};
LiteralLabel.prototype.getLexicalForm = function() {
    return this.lex;
};
LiteralLabel.prototype.getLanguage = function() {
    return this.lang;
};
/**
 * Return the dataype object associated with this literal.
 */
LiteralLabel.prototype.getDatatype = function() {
    return this.dtype;
};
LiteralLabel.prototype.toString = function() {
    var dtypeUri = this.dtype ? this.dtype.getUri() : null;
    var litStr = escapeLiteralString(this.lex);
    var result;

    if (dtypeUri) {
        result = '"' + litStr + '"^^<' + dtypeUri + '>';
    } else {
        result = '"' + litStr + '"' + (this.lang ? '@' + this.lang : '');
    }

    return result;
};


module.exports = LiteralLabel;