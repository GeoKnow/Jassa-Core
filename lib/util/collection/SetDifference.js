var Class = require('../../ext/Class');
var HashSet = require('./HashSet');
var SetDelegateCache = require('./SetDelegateCache');

var SetDifference = Class.create(SetDelegateCache, {
    initialize: function($super, a, b) {
        $super([a, b]);
        this.a = a;
        this.b = b;
    },

    computeDelegate: function() {
        var self = this;
        var result = new HashSet();
        this.a.forEach(function(item) {
            var exclude = self.b.contains(item);
            if(!exclude) {
                result.add(item);
            }

        });

        return result;
    }
});

module.exports = SetDifference;
