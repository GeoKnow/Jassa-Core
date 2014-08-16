var Class = require('../ext/Class');

/**
 *
 *
 */
var Aggregator = Class.create({
    classLabel: 'jassa.sponate.Aggregator',

    getClassName: function() {
        return 'override me';
    },

    toString: function() {
        return 'override me';
    },

    getVarsMentioned: function() {
        throw 'override me';
    },

    createAccumulator: function() {
        throw 'override me';
    },

    /**
     * Get the list of sub aggregators; empty array if none
     */
    getSubAggregators: function() {
        throw 'override me';
    },

//    $getReferences: function(result) {
//        throw 'override me';
//    },

    /**
     * Find an aggregator by an object of type ns.AttrPath.
     * If a string is passed, it will be parsed first.
     *
     *
     */
    findAggregator: function(rawAttrPath, start) {
        console.log('[ERROR] "findPattern" for path "' + rawAttrPath + '" with start ' + start + ' is not supported on this kind of object: ' + JSON.stringify(this));
        throw 'Bailing out';
    },

});

module.exports = Aggregator;
