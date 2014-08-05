var HashMap = require('./hash-map');

var HashSet = function(fnEquals, fnHash) {
    this.initialize(fnEquals, fnHash);
};


HashSet.prototype.initialize = function(fnEquals, fnHash) {
    this.map = new HashMap(fnEquals, fnHash);
};

HashSet.prototype.add = function(item) {
    this.map.put(item, true);
};

HashSet.prototype.contains = function(item) {
    var result = this.map.containsKey(item);
    return result;
};

HashSet.prototype.remove = function(item) {
    this.map.remove(item);
};

HashSet.prototype.entries = function() {
    var result = this.map.entries().map(function(entry) {
        //return entry.getKey();
        return entry.key;
    });

    return result;
};

HashSet.prototype.toString = function() {
    var entries = this.entries();
    var result = '{' + entries.join(', ') + '}';
    return result;
};

module.exports = HashSet;