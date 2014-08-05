// constructor
var RdfDatatype = function() {
    this.classLabel = 'RdfDatatype';
};
RdfDatatype.prototype.getUri = function() {
    throw 'Not implemented';
};
RdfDatatype.prototype.unparse = function() {
    throw 'Not implemented';
};
/** Convert a value of this datatype to lexical form. */
RdfDatatype.prototype.parse = function() {
    throw 'Not implemented';
};

module.exports = RdfDatatype;
