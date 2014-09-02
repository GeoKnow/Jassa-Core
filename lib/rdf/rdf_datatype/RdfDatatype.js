var Class = require('../../ext/Class');

// constructor
var RdfDatatype = Class.create({
    classLabel: 'RdfDatatype',
    getUri: function() {
        throw new Error('Not implemented');
    },
    unparse: function() {
        throw new Error('Not implemented');
    },
    /** Convert a value of this datatype to lexical form. */
    parse: function() {
        throw new Error('Not implemented');
    }
});

module.exports = RdfDatatype;
