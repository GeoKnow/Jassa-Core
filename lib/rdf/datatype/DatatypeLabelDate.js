var Class = require('../../ext/Class');
var DatatypeLabel = require('./DatatypeLabel');

// constructor
var DatatypeLabelDate = Class.create(DatatypeLabel, {
    classLabel: 'jassa.rdf.DatatypeLabelDate',
    parse: function(str) {
        var result = !str ? null : new Date(str);
        return result;
    },
    unparse: function(val) {
        var result = !val ? null : val.toString();
        return result;
    }
});

module.exports = DatatypeLabelDate;
