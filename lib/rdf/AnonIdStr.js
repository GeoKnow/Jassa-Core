var Class = require('../ext/Class');
var AnonId = require('./AnonId');

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
