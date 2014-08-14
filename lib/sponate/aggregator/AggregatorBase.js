var Class = require('../ext/class');

var AggregatorBase = require('./AggregatorBase');
var AttrPath = require('../AttrPath');

/**
 *
 *
 */
var AggregatorBase = Class.create(Aggregator, {
    classLabel: 'jassa.sponate.Aggregator',

    /**
     * Find an aggregator by an object of type ns.AttrPath.
     * If a string is passed, it will be parsed first.
     *
     *
     */
    findPattern: function(rawAttrPath, start) {

        var attrPath;
        if (_(attrPath).isString()) {
            attrPath = ns.AttrPath.parse(rawAttrPath);
        } else {
            attrPath = rawAttrPath;
        }

        start = start ? start : 0;

        var result;
        // On empty paths return this.
        var pathLength = attrPath.size();

        if (start > pathLength) {
            console.log('[ERROR] Start in path ' + start + ' greater than path length ' + pathLength);
        } else if (start == pathLength) {
            result = this;
        } else {
            result = this.$findPattern(attrPath, start);
        }

        return result;
    },

    $findPattern: function(attrPath, start) {
        console.log('[ERROR] "findPattern" for path "' + attrPath + '" is not supported on this kind of object: ' + JSON.stringify(this));
        throw 'Bailing out';
    },

});

module.exports = AggregatorBase;
