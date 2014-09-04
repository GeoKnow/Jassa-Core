var Class = require('../../ext/Class');

var Acc = require('./Acc');

var AccRef = Class.create(Acc, {
    classLabel: 'jassa.sponate.AccRef',

    initialize: function(bindingMapper, refSpec) {
        this.bindingMapper = bindingMapper;
        this.refSpec = refSpec;

        this.refValue = null;

        this.baseValue = null;
    },

    getSubAccs: function() {
        return [];
    },

    getRefSpec: function() {
        return this.refSpec;
    },

    getRefValue: function() {
        return this.refValue;
        //return this.subAcc;
    },

    accumulate: function(binding) {
        var refValue = this.bindingMapper.map(binding, 0);
        this.refValue = refValue;
    },

    getBaseValue: function() {
        return this.baseValue;
    },

    setBaseValue: function(baseValue) {
        this.baseValue = baseValue;
        //console.log('Base VALUE: ', this.refSpec.getAttr(), this.getValue());
    },

    getValue: function() {
        return this.baseValue;

//        var baseValue = this.baseValue;
//
//        var attr = this.refSpec.getAttr();
//        var result = baseValue != null
//            ? (attr != null ? baseValue[attr] : baseValue)
//            : baseValue
//            ;
//
//        console.log('GET VALUE: ', result);
//
//        return result;
    },

});

module.exports = AccRef;
