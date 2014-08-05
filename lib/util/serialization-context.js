var HashMap = require('./hash-map');
var ObjectUtils = require('./object-utils');

/**
 *
 * Essentially this is a map from state hash of the object
 *
 */
var SerializationContext = function() {
    this.initialize();
};


SerializationContext.prototype.initialize = function() {
    this._nextId = 1;

    // A hash map that compares keys by reference equality
    this.objToId = new HashMap(
        function(a, b) {
            return a === b;
        }, function(obj) {
            return ObjectUtils.hashCode(obj);
        }
    );


    this.idToState = {};
};

SerializationContext.prototype.nextId = function() {
    var result = '' + this._nextId++;
    return result;
};

SerializationContext.prototype.getIdToState = function() {
    return this.idToState;
};

SerializationContext.prototype.getObjToId = function() {
    return this.objToId;
};


module.exports = SerializationContext;