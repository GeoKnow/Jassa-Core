var HashMap = require('./hash-map');

/**
 * A map that retains insert order
 *
 */
var ListMap = function(fnEquals, fnHash) {
    this.initialize(fnEquals, fnHash);
};


ListMap.prototype.initialize = function(fnEquals, fnHash) {
    this.map = new HashMap(fnEquals, fnHash);
    this.keys = [];
};

ListMap.prototype.put = function(key, value) {
    var v = this.map.get(key);
    if (v) {
        throw 'Key ' + v + ' already inserted';
    }

    this.keys.push(key);
    this.map.put(key, value);
};

ListMap.prototype.get = function(key) {
    var result = this.map.get(key);
    return result;
};

ListMap.prototype.getByIndex = function(index) {
    var key = this.keys[index];
    var result = this.map.get(key);
    return result;
};

ListMap.prototype.entries = function() {
    var self = this;
    var result = this.keys.map(function(key) {
        var value = self.map.get(key);

        var r = {
            key: key,
            val: value
        };
        return r;
    });

    return result;
};

ListMap.prototype.remove = function(key) {
    console.log(key);
    throw 'Implement me';
    /*
        var keys = this.keys;
        for(var i = 0; i < keys.length; ++i) {
            
        }
        
        this.map.remove(key);
        */
};

ListMap.prototype.removeByIndex = function(index) {
    var key = this.keys[index];

    this.remove(key);
};

ListMap.prototype.keyList = function() {
    return this.keys;
};

ListMap.prototype.size = function() {
    return this.keys.length;
};


module.exports = ListMap;