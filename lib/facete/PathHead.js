var Class = require('../ext/Class');

var Path = require('./Path');

/**
 * A path head combines a path with a direction it is facing.
 * It is used to denote the set of outgoing or incoming facets.
 */
var PathHead = Class.create({
    initialize: function(path, isInverse) {
        this.path = path;
        this._isInverse = !!isInverse; // ensure boolean
    },

    getPath: function() {
        return this.path;
    },

    isInverse: function() {
        return this._isInverse;
    },

    toString: function() {
        return '' + this.path + (this._isInverse ? ' (inverse)' : '');
    },
});

PathHead.parse = function(pathStr, isInverse) {
    var path = Path.parse(pathStr);
    var result = new PathHead(path, !!isInverse);
    return result;
};

module.exports = PathHead;
