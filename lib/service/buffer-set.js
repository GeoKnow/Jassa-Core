var SetList = require('../util/set-list');
var Buffer = require('./buffer');

var BufferSet = function(maxItemCount) {
    Buffer.call(this);

    this.initialize(maxItemCount);
};
// inherit
BufferSet.prototype = Object.create(Buffer.prototype);
// hand back the constructor
BufferSet.prototype.constructor = BufferSet;

BufferSet.prototype.initialize = function(maxItemCount) {
    // FIXME: util.SetList not defined
    this.data = new SetList();
    this.maxItemCount = maxItemCount;
};

BufferSet.prototype.add = function(item) {
    if (this.isFull()) {
        throw 'Buffer was full with ' + this.maxItemCount + ' items; Could not add item ' + item;
    }

    this.data.add(item);
};

BufferSet.prototype.isFull = function() {
    var result = this.data.size() >= this.maxItemCount;
    return result;
};

BufferSet.prototype.clear = function() {
    this.data.clear();
};

BufferSet.prototype.entries = function() {
};

module.exports = BufferSet;
