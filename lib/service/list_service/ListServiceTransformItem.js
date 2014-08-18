var Class = require('../../ext/Class');
var ListService = require('./ListService');

/**
 * A list service that transforms the input concept to another
 * which gets passed to the underlying list service
 * 
 */
var ListServiceTransformItem = Class.create(ListService, {
    initialize: function(listService, fnTransformItem) {
        this.listService = listService;
        this.fnTransformItem = fnTransformItem;
    },

    fetchItems: function(concept, limit, offset) {

        var self = this;
        var result = this.listService.fetchItems(concept, limit, offset).then(function(items) {
            var r = items.map(self.fnTransformItem);
            return r;
        });

        return result;
    },

    fetchCount: function(concept, itemLimit, rowLimit) { 
        var result = this.listService.fetchCount(concept, itemLimit, rowLimit);
        return result;
    },

});

module.exports = ListServiceTransformItem;
