var Class = require('../ext/Class');

var FacetNodeState = require('./FacetNodeState');
var HashMap = require('../util/collection/HashMap');

var FacetTreeConfig = Class.create({
    initialize: function(defaultState) {
        this.defaultState = defaultState || new FacetNodeState();
        this.pathToState = new HashMap();
    },

    getState: function(path) {
        var override = this.pathToState.get(path);
        var result = override || this.defaultState;
        return result;
    },

    setState: function(path, state) {
        this.pathToState.put(path, state);
    },

});

module.exports = FacetTreeConfig;