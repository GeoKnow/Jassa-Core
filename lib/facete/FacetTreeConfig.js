var Class = require('../ext/Class');

var BestLabelConfig = require('../sparql/BestLabelConfig');
var FacetConfig = require('./FacetConfig');
var HashMap = require('../util/collection/HashMap');

var FacetTreeConfig = Class.create({
    initialize: function(facetConfig, bestLiteralConfig, pathToState, tagMap, tagFn) {
        this.facetConfig = facetConfig || new FacetConfig();
        this.pathToState = pathToState || new HashMap();
        this.bestLiteralConfig = bestLiteralConfig || new BestLabelConfig();
        this.tagMap = tagMap || new HashMap();
        this.tagFn = tagFn;
    },

    getFacetConfig: function() {
        return this.facetConfig;
    },

    getPathToState: function() {
        return this.pathToState;
    },

    getBestLiteralConfig: function() {
        return this.bestLiteralConfig;
    },

    getTagMap: function() {
        return this.tagMap;
    },

    getTagFn: function() {
        return this.tagFn;
    }
});

/*
var FacetTreeConfig = Class.create({
    initialize: function(defaultState) {
        //this.defaultState = defaultState || new FacetNodeState();
        this.pathToState = new HashMap();
    },

    getState: function(path) {
        var result = this.pathToState.get(path);
        if(!result) {
            result = new FacetNodeState();
            this.pathToState.put(path, result);
        }
        //var result = override || this.defaultState;
        return result;
    },

    setState: function(path, state) {
        this.pathToState.put(path, state);
    },

});
*/


module.exports = FacetTreeConfig;
