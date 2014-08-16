var Class = require('../../ext/Class');
var DatatypeLabel = require('./DatatypeLabel');

// constructor
var DatatypeLabelFloat = Class.create(DatatypeLabel, {
    classLabel: 'jassa.rdf.DatatypeLabelFloat',
    parse: function(str) {
        return parseFloat(str);
    },
    unparse: function(val) {
        return val.toString();
    },
});

module.exports = DatatypeLabelFloat;
