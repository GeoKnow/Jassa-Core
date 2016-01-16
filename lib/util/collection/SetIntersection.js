var Class = require('../../ext/Class');
var HashSet = require('./HashSet');
var SetDelegateCache = require('./SetDelegateCache');

var SetIntersection = Class.create(SetDelegateCache, {
    initialize: function($super, sets) {
        $super(sets);
    },

    computeDelegate: function() {
        var self = this;

        var union = new HashSet();
        this._sets.forEach(function(set) {
            union.addAll(set);
        });
        //console.log('intersection/union: ', union.entries());

        // Keep those items that are contained in every set
        var result = new HashSet();
        union.forEach(function(item) {
            var retain = self._sets.every(function(set) {
                var r = set.contains(item);
                //console.log('contains? ', item, set.entries(), r);
                return r;
            });

            if(retain) {
                result.add(item);
            }
        });

        return result;
    }
});

module.exports = SetIntersection;
