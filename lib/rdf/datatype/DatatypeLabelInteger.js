var Class = require('../../ext/Class');
var DatatypeLabel = require('./DatatypeLabel');

// constructor
var DatatypeLabelInteger = Class.create(DatatypeLabel, {
    classLabel: 'jassa.rdf.DatatypeLabelInteger',
    parse: function(str) {
        return parseInt(str, 10);
    },
    unparse: function(val) {
        return val.toString();
    },
});

module.exports = DatatypeLabelInteger;
