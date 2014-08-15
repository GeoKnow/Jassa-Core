var Class = require('../../ext/Class');
var ListService = require('./ListService');

ListServicePageExpand = Class.create(ListService, {
    initialize: function(listService, pageSize) {
        this.listService = listService;
        this.pageSize = pageSize;
    },

    fetchItems: function(concept, limit, offset) {
        var x = ns.PageExpandUtils.computeRange(limit, offset, this.pageSize);
        
        var p = this.listService.fetchItems(concept, x.limit, x.offset);
        var result = p.pipe(function(items) {

            var end = x.subLimit ? x.subOffset + x.subLimit : bindings.length;
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
