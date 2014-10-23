var Class = require('../../ext/Class');
var ListService = require('./ListService');

var ListServiceFn = Class.create(ListService, {
    initialize: function(listServiceFn) {
        this.listServiceFn = listServiceFn;
    },

    fetchItems: function(filter, limit, offset) {
        var listService = this.listServiceFn();
        var result = listService.fetchItems(filter, limit, offset);
        return result;
    },

    fetchCount: function(filter, itemLimit, rowLimit) {
        var listService = this.listServiceFn();
        var result = listService.fetchCount(filter, itemLimit, rowLimit);
        return result;
    }
});

module.exports = ListServiceFn;
