var Class = require('../ext/class');

var MultiMapObjectArray = Class.create({
    initialize: function() {
        this.entries = {};
    },

    clone: function() {
        var result = new MultiMapObjectArray();
        result.addMultiMap(this);

        return result;
    },

    clear: function() {
        //this.entries = {},
        var keys = Object.keys(this.entries);
        keys.forEach(function(key) {
            delete this.entries[key];
        });
    },

    addMultiMap: function(other) {
        for (var key in other.entries) {
            var values = other.entries[key];

            for (var i = 0; i < values.length; ++i) {
                var value = values[i];

                this.put(key, value);
            }
        }
    },

    get: function(key) {
        return (key in this.entries) ? this.entries[key] : [];
    },

    put: function(key, value) {
        var values;

        if (key in this.entries) {
            values = this.entries[key];
        } else {
            values = [];
            this.entries[key] = values;
        }

        values.push(value);
    },

    removeKey: function(key) {
        delete this.entries[key];
    },
});

module.exports = MultiMapObjectArray;
