var RdfDatatype = require('./rdf-datatype');
var TypedValue = require('./typed-value');

// constructor
var BaseDatatype = function(datatypeUri) {
    RdfDatatype.call(this);

    this.classLabel = 'BaseDatatype';

    // init
    this.initialize(datatypeUri);
};
// inherit
BaseDatatype.prototype = Object.create(RdfDatatype.prototype);
// hand back the constructor
BaseDatatype.prototype.constructor = BaseDatatype;
// assign new functions
BaseDatatype.prototype.initialize = function(datatypeUri) {
    this.datatypeUri = datatypeUri;
};
BaseDatatype.prototype.getUri = function() {
    return this.datatypeUri;
};
BaseDatatype.prototype.unparse = function(value) {
    var result;

    if (value instanceof TypedValue) {
        result = value.getLexicalValue();

    } else {
        result = '' + value;
    }
    return result;
};
/** Convert a value of this datatype to lexical form. */
BaseDatatype.prototype.parse = function(str) {
    return new TypedValue(str, this.datatypeUri);
};
BaseDatatype.prototype.toString = function() {
    return 'Datatype [' + this.datatypeUri + ']';
};

module.exports = BaseDatatype;