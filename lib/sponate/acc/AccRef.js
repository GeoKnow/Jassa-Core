var Class = require('../../ext/Class');

var Acc = require('./Acc');

var AccRef = Class.create(Acc, {
    classLabel: 'jassa.sponate.AccRef',

    initialize: function(bindingMapper, refSpec) {
        this.bindingMapper = bindingMapper;
        this.refSpec = refSpec;

        this.refValue = null;

        this.value = null;
    },

    getRefValue: function() {
        return this.refValue;
        //return this.subAcc;
    },

    accumulate: function(binding) {
        var refValue = this.bindingMapper.map(binding, 0);
        this.refValue = refValue;
    },

    getValue: function() {
        return this.value;
    },

    // The sponate system takes care of resolving references
    setValue: function(value) {
        this.value = value;
    },
});

module.exports = AccRef;
