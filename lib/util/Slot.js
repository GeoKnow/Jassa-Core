var Class = require('../ext/Class');

var Slot = Class.create({
    initialize : function(obj, attr, meta) {
        this.obj = obj;
        this.attr = attr;

        this.meta = meta;
    },

    setValue : function(value) {
        this.obj[this.attr] = value;
    },

    getValue : function() {
        return this.obj[this.attr];
    },

    getMeta : function() {
        return this.meta;
    },

    toString : function() {
        return JSON.stringify(this);
    }
});

module.exports = Slot;
