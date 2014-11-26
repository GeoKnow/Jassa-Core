var Class = require('../../ext/Class');
var DatatypeLabel = require('./DatatypeLabel');

// constructor
var DatatypeLabelDate = Class.create(DatatypeLabel, {
    classLabel: 'jassa.rdf.DatatypeLabelDate',
    parse: function(str) {
        return Date.parse(str);
    },
    unparse: function(val) {
        return val.toString();
    }
});

module.exports = DatatypeLabelDate;
