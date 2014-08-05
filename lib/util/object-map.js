/**
 * A map that just wraps a json object
 * Just there to provide a unified map interface
 */
var ObjectMap = function(data) {
    this.initialize(data);
};


ObjectMap.prototype.initialize = function(data) {
    this.data = data ? data : {};
};

ObjectMap.prototype.get = function(key) {
    return this.data[key];
};

ObjectMap.prototype.put = function(key, val) {
    this.data[key] = val;
};

ObjectMap.prototype.remove = function(key) {
    delete this.data[key];
};

ObjectMap.prototype.entries = function() {
    throw "Not implemented";
};

ObjectMap.prototype.toString = function() {
    return JSON.stringify(this.data);
};

module.exports = ObjectMap;