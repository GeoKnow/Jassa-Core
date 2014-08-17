var Class = require('../ext/Class');

var Acc = require('./Acc');

var AccFn = Class.create(Acc, {
    classLabel: 'jassa.sponate.AccFn',

    initialize: function(fnBinding) {
        this.fnBinding = fnBinding;
        
        this.value = null;
    },

    accumulate: function(binding) {
        this.value = this.fn(binding);
    },

    getValue: function() {
        return this.value;
    },
    
    getSubAccs: function() {
        return [];
    },

});

module.exports = AccFn;
