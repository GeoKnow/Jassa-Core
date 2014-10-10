var Class = require('../../ext/Class');

var Cache = Class.create({
    getItem: function(key) {
        throw new Error('not implemented');
    },

    setItem: function(key, val) {
        throw new Error('not implemented');
    },

});

module.exports = Cache;
