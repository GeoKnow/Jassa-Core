var Class = require('../ext/Class');


var LookupServiceBuilder = Class.create({
    initialize: function(ls) {
        this.ls = ls;
    },

    create: function() {
        return this.ls;
    },

    filter: function() {
        // TODO Implement me
    },

    transform: function() {
        // TODO Implement me
    }
});


LookupServiceBuilder.from = function(ls) {
    var result = new LookupServiceBuilder(ls);
    return result;
};

module.exports = LookupServiceBuilder;

