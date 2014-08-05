var defaultEquals = require('./default-equals');

var ArrayList = function(fnEquals) {
    this.initialize(fnEquals);
};

ArrayList.prototype.initialize = function(fnEquals) {
    this.items = [];
    this.fnEquals = fnEquals || defaultEquals;
};

ArrayList.prototype.setItems = function(items) {
    this.items = items;
};

ArrayList.prototype.getArray = function() {
    return this.items;
};

ArrayList.prototype.get = function(index) {
    var result = this.items[index];
    return result;
};

ArrayList.prototype.add = function(item) {
    this.items.push(item);
};

ArrayList.prototype.indexesOf = function(item) {
    var items = this.items;
    var fnEquals = this.fnEquals;

    var result = [];

    items.forEach(function(it, index) {
        var isEqual = fnEquals(item, it);
        if (isEqual) {
            result.push(index);
        }
    });

    return result;
};

ArrayList.prototype.contains = function(item) {
    var indexes = this.indexesOf(item);
    var result = indexes.length > 0;
    return result;
};

ArrayList.prototype.firstIndexOf = function(item) {
    var indexes = this.indexesOf(item);
    var result = (indexes.length > 0) ? indexes[0] : -1;
    return result;
};

ArrayList.prototype.lastIndexOf = function(item) {
    var indexes = this.indexesOf(item);
    var result = (indexes.length > 0) ? indexes[indexes.length - 1] : -1;
    return result;
};

/**
 * Removes the first occurrence of the item from the list
 */
ArrayList.prototype.remove = function(item) {
    var index = this.firstIndexOf(item);
    if (index >= 0) {
        this.removeByIndex(index);
    }
};

ArrayList.prototype.removeByIndex = function(index) {
    this.items.splice(index, 1);
};

ArrayList.prototype.size = function() {
    return this.items.length;
};


module.exports = ArrayList;
