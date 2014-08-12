var Class = require('../../ext/class');

// constructor
var RdfDatatype = Class.create({
    classLabel: 'RdfDatatype',
    getUri: function() {
        throw 'Not implemented';
    },
    unparse: function() {
        throw 'Not implemented';
    },
    /** Convert a value of this datatype to lexical form. */
    parse: function() {
        throw 'Not implemented';
    },
});

module.exports = RdfDatatype;
