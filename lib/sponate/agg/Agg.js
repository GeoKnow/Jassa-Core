var Class = require('../ext/Class');

/**
 *
 *
 */
var Agg = Class.create({
    classLabel: 'jassa.sponate.Agg',

    getClassName: function() {
        return 'override me';
    },

    toString: function() {
        return 'override me';
    },

    getVarsMentioned: function() {
        throw 'override me';
    },

    createAcc: function() {
        throw 'override me';
    },

    /**
     * Get the list of sub aggregators; empty array if none
     */
    getSubAggs: function() {
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
    findAgg: function(rawAttrPath, start) {
        console.log('[ERROR] "findPattern" for path "' + rawAttrPath + '" with start ' + start + ' is not supported on this kind of object: ' + JSON.stringify(this));
        throw 'Bailing out';
    },

});

module.exports = Agg;
