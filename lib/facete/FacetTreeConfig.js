var Class = require('../ext/Class');

var FacetTreeConfig = Class.create({
    initialize: function() {
        //this.facetConfig = facetConfig;
        //this.pathToFilter;
        //this.pathToSearchString;
        //this.pathToExpansion = pathToExpansion || new HashMap(); // -1 opened+inverse, 1 = opened+forward, closed otherwise
    },

    getFacetConfig: function() {
        return this.facetConfig;
    },

    getPathToFilter: function() {
        return this.pathToFilter;
    },

    getPathToExpansion: function() {
        return this.pathToExpansion;
    },

});

module.exports = FacetTreeConfig;
