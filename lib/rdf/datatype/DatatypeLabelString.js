var Class = require('../../ext/Class');
var DatatypeLabel = require('./DatatypeLabel');

// constructor
var DatatypeLabelString = Class.create(DatatypeLabel, {
    classLabel: 'jassa.rdf.DatatypeLabelString',
    parse: function(str) {
        return str;
    },
    unparse: function(val) {
        return val.toString();
    },
});

module.exports = DatatypeLabelString;
