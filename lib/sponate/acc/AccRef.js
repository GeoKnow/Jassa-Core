var Class = require('../../ext/Class');

var Acc = require('./Acc');

var AccRef = Class.create(Acc, {
    classLabel: 'jassa.sponate.AccRef',

    initialize: function(subAcc, refSpec) {
        this.subAcc = subAcc;
        this.refSpec = refSpec;
        
        this.value = null;
    },

    accumulate: function(binding) {
        this.subAcc.accumulate(binding);
    },

    getValue: function() {
        return this.json;
    },

    // The sponate system takes care of resolving references
    setValue: function(value) {
        this.value = value;
    },
});

module.exports = AccRef;
