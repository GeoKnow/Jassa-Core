var Class = require('../ext/Class');

var ObjectUtils = require('../../util/ObjectUtils');

var Aggregator = require('./Aggregator');
var AttrPath = require('../AttrPath');

/**
 *
 *
 */
var AggregatorBase = Class.create(Aggregator, {
    classLabel: 'jassa.sponate.Aggregator',

    /**
     * Find an aggregator by an object of type AttrPath.
     * If a string is passed, it will be parsed first.
     *
     *
     */
    findPattern: function(rawAttrPath, start) {

        var attrPath;
        if (ObjectUtils.isString(attrPath)) {
            attrPath = AttrPath.parse(rawAttrPath);
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
        console.log('[ERROR] "findPattern" for path "' + attrPath + '" with start ' + start + ' is not supported on this kind of object: ' + JSON.stringify(this));
        throw 'Bailing out';
    },

});

module.exports = AggregatorBase;
