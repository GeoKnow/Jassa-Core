var Class = require('../../ext/class');
var DatatypeLabel = require('./label');

// constructor
var DatatypeLabelInteger = Class.create(DatatypeLabel, {
    classLabel: 'DatatypeLabelInteger',
    parse: function(str) {
        return parseInt(str, 10);
    },
    unparse: function(val) {
        return val.toString();
    },
});

module.exports = DatatypeLabelInteger;
