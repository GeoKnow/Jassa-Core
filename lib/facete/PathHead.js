var Class = require('../ext/Class');

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

});

module.exports = PathHead;
