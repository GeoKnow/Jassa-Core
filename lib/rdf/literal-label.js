var Class = require('../ext/class');
var Node_Concrete = require('./node/concrete');

// helper function
// FIXME: WAT?
var escapeLiteralString = function(str) {
    return str;
};

// constructor
var LiteralLabel = Class.create(Node_Concrete, {
    classLabel: 'LiteralLabel',

    // assign new functions

    /**
     * Note: The following should hold:
     * dtype.parse(lex) == val
     * dtype.unpars(val) == lex
     *
     * However, this class doesn't care about it.
     */
    initialize: function(val, lex, lang, dtype) {
        this.val = val;
        this.lex = lex;
        this.lang = lang;
        this.dtype = dtype;
    },
    /** Get the literal's value as a JavaScript object */
    getValue: function() {
        return this.val;
    },
    getLexicalForm: function() {
        return this.lex;
    },
    getLanguage: function() {
        return this.lang;
    },
    /**
     * Return the dataype object associated with this literal.
     */
    getDatatype: function() {
        return this.dtype;
    },
    toString: function() {
        var dtypeUri = this.dtype ? this.dtype.getUri() : null;
        var litStr = escapeLiteralString(this.lex);
        var result;

        if (dtypeUri) {
            result = '"' + litStr + '"^^<' + dtypeUri + '>';
        } else {
            result = '"' + litStr + '"' + (this.lang ? '@' + this.lang : '');
        }

        return result;
    },
});

module.exports = LiteralLabel;