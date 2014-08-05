var MultiMapObjectArray = function() {
    this.initialize();
};


MultiMapObjectArray.prototype.initialize = function() {
    this.entries = {};
};

MultiMapObjectArray.prototype.clone = function() {
    var result = new MultiMapObjectArray();
    result.addMultiMap(this);

    return result;
};

MultiMapObjectArray.prototype.clear = function() {
    //this.entries = {};
    var keys = Object.keys(this.entries);
    keys.forEach(function(key) {
        delete this.entries[key];
    });
};

MultiMapObjectArray.prototype.addMultiMap = function(other) {
    for (var key in other.entries) {
        var values = other.entries[key];

        for (var i = 0; i < values.length; ++i) {
            var value = values[i];

            this.put(key, value);
        }
    }
};

MultiMapObjectArray.prototype.get = function(key) {
    return (key in this.entries) ? this.entries[key] : [];
};

MultiMapObjectArray.prototype.put = function(key, value) {
    var values;

    if (key in this.entries) {
        values = this.entries[key];
    } else {
        values = [];
        this.entries[key] = values;
    }

    values.push(value);
};

MultiMapObjectArray.prototype.removeKey = function(key) {
    delete this.entries[key];
};

module.exports = MultiMapObjectArray;