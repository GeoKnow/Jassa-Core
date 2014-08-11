var Class = require('../../ext/class');
var DatatypeLabel = require('./label');

// constructor
var DatatypeLabelString = Class.create(DatatypeLabel, {
    classLabel: 'DatatypeLabelString',
    parse: function(str) {
        return str;
    },
    unparse: function(val) {
        return val.toString();
    },
});

module.exports = DatatypeLabelString;
