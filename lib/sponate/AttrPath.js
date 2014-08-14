var Class = require('../ext/class');

/**
 * A path of attributes.
 *
 * Just an array of attribute names.
 *
 *
 */
var AttrPath = Class.create({
    classLabel: 'AttrPath',

    initialize: function(steps) {
        this.steps = steps ? steps : [];
    },

    getSteps: function() {
        return this.steps;
    },

    toString: function() {
        return this.steps.join('.');
    },

    slice: function(start, end) {
        var result = this.steps.slice(start, end);
        return result;
    },

    first: function() {
        return this.steps[0];
    },

    at: function(index) {
        return this.steps[index];
    },

    isEmpty: function() {
        return this.steps.length == 0;
    },

    size: function() {
        return this.steps.length;
    },

    concat: function(that) {
        var tmp = this.steps.concat(that.getSteps());
        var result = new ns.AttrPath(tmp);
        return result;
    },

    /**
     * Retrieve the value of a path in a json document
     *
     */
    find: function(doc) {
        var result = doc;

        var steps = this.steps;
        for (var i = 0; i < steps.length; ++i) {
            var attr = steps[i];

            if (!_(result).isObject()) {
                console.log('[ERROR] Cannot access attribute of non-object', this.steps, doc, result);
                throw 'Bailing out';
            }

            result = result[attr];
        }

        return result;
    },

});

AttrPath.parse = function(str) {
    var steps = str.split('.');

    return new ns.AttrPath(steps);
};

modules.exports = AttrPath;
