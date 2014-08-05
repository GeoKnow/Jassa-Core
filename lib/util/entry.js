var Entry = function(key, value) {
    this.initialize(key, value);
};


Entry.prototype.initialize = function(key, value) {
    this.key = key;
    this.value = value;
};

Entry.prototype.getKey = function() {
    return this.key;
};

Entry.prototype.getValue = function() {
    return this.value;
};

Entry.prototype.toString = function() {
    return this.key + "->" + this.value;
};

module.exports = Entry;