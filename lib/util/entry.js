var Class = require('../ext/class');

var Entry = Class.create({
    initialize: function(key, value) {
        this.key = key;
        this.value = value;
    },

    getKey: function() {
        return this.key;
    },

    getValue: function() {
        return this.value;
    },

    toString: function() {
        return this.key + '->' + this.value;
    },
});

module.exports = Entry;