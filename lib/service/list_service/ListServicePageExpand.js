var Class = require('../../ext/Class');
var PageExpandUtils = require('../PageExpandUtils');
var ListService = require('./ListService');

var ListServicePageExpand = Class.create(ListService, {
    initialize: function(listService, pageSize) {
        this.listService = listService;
        this.pageSize = pageSize;
    },

    fetchItems: function(concept, limit, offset) {
        var x = PageExpandUtils.computeRange(limit, offset, this.pageSize);
        
        var p = this.listService.fetchItems(concept, x.limit, x.offset);
        var result = p.then(function(items) {

            var end = x.subLimit ? x.subOffset + x.subLimit : items.length;
            var r = items.slice(x.subOffset, end); 
            
            return r;
        });
        
        return result;
    },

    fetchCount: function(concept, itemLimit, rowLimit) {
        var result = this.listService.fetchCount(concept, itemLimit, rowLimit);
        return result;
    },

});

module.exports = ListServicePageExpand;
