var Class = require('../../ext/Class');
var ObjectUtils = require('../../util/ObjectUtils');
var Acc = require('./Acc');

var AccLiteral = Class.create(Acc, {
    classLabel: 'jassa.sponate.AccLiteral',

    initialize: function(bindingMapper) {
        this.bindingMapper = bindingMapper;

        this.value = null;
    },

    accumulate: function(binding) {
        var newValue = this.bindingMapper.map(binding, 0);

        if (false) {
            if(this.value != null && !ObjectUtils.isEqual(this.value, newValue)) {
                console.log('[WARN] Reassigned value: Original', this.value, ' New: ', newValue);
            }
        }

        this.value = newValue;
    },

    getValue: function() {
        return this.value;
    },

    getSubAccs: function() {
        return [];
    },

});

module.exports = AccLiteral;
