var Class = require('../../ext/Class');
var HashSet = require('./HashSet');
var SetDelegateCache = require('./SetDelegateCache');


var SetUnion = Class.create(SetDelegateCache, {
    initialize: function($super, sets) {
        $super(sets);
    },

    computeDelegate: function() {
        var result = new HashSet();
        this._sets.forEach(function(set) {
            result.addAll(set);
        });
        //console.log('yay here computed: ', result);
        return result;
    }
});

module.exports = SetUnion;
