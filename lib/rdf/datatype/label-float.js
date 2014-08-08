var Class = require('../../ext/class');
var DatatypeLabel = require('./label');

// constructor
var DatatypeLabelFloat = Class.create(DatatypeLabel, {
    classLabel: 'DatatypeLabelFloat',
    parse: function(str) {
        return parseFloat(str);
    },
    unparse: function(val) {
        return '' + val;
    },
});

module.exports = DatatypeLabelFloat;
