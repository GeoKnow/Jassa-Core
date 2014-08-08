var Class = require('../ext/class');
var AnonId = require('./anon-id');

// constructor
var AnonIdStr = Class.create(AnonId, {
    classLabel: 'AnonIdStr',
    initialize: function(label) {
        this.label = label;
    },
    getLabelString: function() {
        return this.label;
    },
    toString: function() {
        return this.label;
    },
});

module.exports = AnonIdStr;
