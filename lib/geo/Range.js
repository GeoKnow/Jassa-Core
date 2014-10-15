var Class = require('../ext/Class');

var Range = Class.create({
    initialize: function(min, max) {
        this.min = min;
        this.max = max;
    },

    getOverlap: function(other) {
        var min = Math.max(this.min, other.min);
        var max = Math.min(this.max, other.max);

        return (min > max) ? null : new Range(min, max);
    }
});

module.exports = Range;
