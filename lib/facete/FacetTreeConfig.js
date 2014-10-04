var Class = require('../ext/Class');

var BestLabelConfig = require('../sparql/BestLabelConfig');
var FacetConfig = require('./FacetConfig');
var HashMap = require('../util/collection/HashMap');
//var FacetNodeState = require('./FacetNodeState');
var FacetTreeState = require('./FacetTreeState');
var ListFilter = require('./ListFilter');

var FacetTreeConfig = Class.create({
    initialize: function(facetConfig, bestLiteralConfig, facetTreeState, tagMap, tagFn) {
        this.facetConfig = facetConfig || new FacetConfig();
        this.bestLiteralConfig = bestLiteralConfig || new BestLabelConfig();

        this.facetTreeState = facetTreeState || new FacetTreeState();

        this.tagMap = tagMap || new HashMap();
        this.tagFn = tagFn;
    },

    getFacetConfig: function() {
        return this.facetConfig;
    },

    getFacetTreeState: function() {
        return this.facetTreeState;
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
