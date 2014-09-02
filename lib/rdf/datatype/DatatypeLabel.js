var Class = require('../../ext/Class');

// constructor
var DatatypeLabel = Class.create({
    classLabel: 'DatatypeLabel',
    parse: function() {
        throw new Error('Not implemented');
    },
    unparse: function() {
        throw new Error('Not implemented');
    }
});

module.exports = DatatypeLabel;
