var Class = require('../ext/Class');

var Path = require('./Path');

var ObjectUtils = require('../util/ObjectUtils');

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

    equals: function(that) {
        var result =
            this === that ||
                (this._isInverse === that._isInverse && (
                    ObjectUtils.isEqual(this.path, that.path)));

        return result;
    },

    hashCode: function() {
        if(this.hash == null) {
            this.hash = (this._isInverse ? 3 : 7) * this.path.hashCode();
        }

        return this.hash;
    },

    isInverse: function() {
        return this._isInverse;
    },

    toString: function() {
        return '' + this.path + (this._isInverse ? ' (inverse)' : '');
    },

    up: function(_isInverse) {
        var newPath = this.path.slice(0, -1);
        _isInverse = _isInverse == null ? this._isInverse : _isInverse;

        var result = new PathHead(newPath, _isInverse);
        return result;
    }
});

PathHead.parse = function(pathStr, isInverse) {
    var path = Path.parse(pathStr);
    var result = new PathHead(path, !!isInverse);
    return result;
};

module.exports = PathHead;
