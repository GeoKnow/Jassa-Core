var HashMap = require('./hash-map');

var HashBidiMap = function(fnEquals, fnHash, inverseMap) {
    this.initialize(fnEquals, fnHash, inverseMap);
};

/**
 *
 */
HashBidiMap.prototype.initialize = function(fnEquals, fnHash, inverseMap) {
    this.forward = new HashMap(fnEquals, fnHash);
    this.inverse = inverseMap ? inverseMap : new HashBidiMap(fnEquals, fnHash, this);
};

HashBidiMap.prototype.getInverse = function() {
    return this.inverse;
};

HashBidiMap.prototype.put = function(key, val) {
    this.remove(key);

    this.forward.put(key, val);
    this.inverse.forward.put(val, key);
};

HashBidiMap.prototype.remove = function(key) {
    var priorVal = this.get(key);
    this.inverse.forward.remove(priorVal);
    this.forward.remove(key);
};

HashBidiMap.prototype.getMap = function() {
    return this.forward;
};

HashBidiMap.prototype.get = function(key) {
    var result = this.forward.get(key);
    return result;
};

HashBidiMap.prototype.keyList = function() {
    var result = this.forward.keyList();
    return result;
};

module.exports = HashBidiMap;
