var Class = require('../../ext/Class');

var DataService = require('./DataService');


var DataServiceFilter = Class.create({
    initialize: function(delegate, filterFn) {
        this.delegate = delegate;
        this.filterFn = filterFn || function() { return true; };
    },
    fetchData: function(concept) {
        var self = this;
        return this.delegate.fetchData(concept).then(function(entries) {
            return entries.filter(self.filterFn);
        });
    },
    setFilter: function(filterFn) {
        this.filter = filterFn;
    }
});

module.exports = DataServiceFilter;
