var Class = require('../ext/class');
var SetList = require('../util/set-list');
var Buffer = require('./buffer');

var BufferSet = Class.create(Buffer, {
    initialize: function(maxItemCount) {
        // FIXME: util.SetList not defined
        this.data = new SetList();
        this.maxItemCount = maxItemCount;
    },

    add: function(item) {
        if (this.isFull()) {
            throw 'Buffer was full with ' + this.maxItemCount + ' items; Could not add item ' + item;
        }

        this.data.add(item);
    },

    isFull: function() {
        var result = this.data.size() >= this.maxItemCount;
        return result;
    },

    clear: function() {
        this.data.clear();
    },

    entries: function() {},
});

module.exports = BufferSet;