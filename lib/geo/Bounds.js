var Class = require('../ext/Class');
var Point = require('./Point');
var Range = require('./Range');

var Bounds = Class.create({
    initialize: function(left, bottom, right, top) {
        this.left = left;
        this.right = right;
        this.bottom = bottom;
        this.top = top;
    },

    containsPoint: function(point) {
        return point.x >= this.left && point.x < this.right && point.y >= this.bottom && point.y < this.top;
    },


    getCenter: function() {
        return new Point(0.5 * (this.left + this.right), 0.5 * (this.bottom + this.top));
    },

    getWidth: function() {
        return this.right - this.left;
    },

    getHeight: function() {
        return this.top - this.bottom;
    },


    /**
     * Checks for full containment (mere overlap does not yield true)
     *
     * @param bounds
     * @returns {Boolean}
     */
    contains: function(bounds) {
        return bounds.left >= this.left && bounds.right < this.right && bounds.bottom >= this.bottom && bounds.top < this.top;
    },

    rangeX: function() {
        return new Range(this.left, this.right);
    },

    rangeY: function() {
        return new Range(this.bottom, this.top);
    },

    overlap: function(bounds) {
        if(!bounds.rangeX || !bounds.rangeY) {
            console.error('Missing range');
            throw 'Error';
        }

        var ox = this.rangeX().getOverlap(bounds.rangeX());
        if(!ox) {
            return null;
        }

        var oy = this.rangeY().getOverlap(bounds.rangeY());
        if(!oy) {
            return null;
        }

        return new Bounds(ox.min, oy.min, oy.max, ox.max);
    },

    isOverlap: function(bounds) {
        var tmp = this.overlap(bounds);
        return tmp != null;
    },

    toString: function() {
    //return '[' + this.left + ', ' + this.bottom + ', ' + this.right + ', ' + this.top + ']';
        return '[' + this.left + ' - ' + this.right + ', ' + this.bottom + ' - ' + this.top + ']';
    }
});

Bounds.createFromJson = function(json) {
    var result = new Bounds(json.left, json.bottom, json.right, json.top);
    return result;
};

module.exports = Bounds;
