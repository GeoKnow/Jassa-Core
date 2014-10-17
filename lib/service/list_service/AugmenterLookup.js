var Class = require('../../ext/Class');

var ObjectUtils = require('../../util/ObjectUtils');

var AugmenterLookup = Class.create({
    initialize: function(lookupService, itemToKeyFn, mergeFn) {
        this.lookupService = lookupService;

        this.itemToKeyFn = itemToKeyFn || function(item) {
            return item.key;
        };

        this.mergeFn = mergeFn || function(base, aug) {
            var r = ObjectUtils.extend(base, aug);
            return r;
        };
    },

    augment: function(items) {
        //console.log('GOT ITEMS: ' + JSON.stringify(items));

        var keys = items.map(this.itemToKeyFn);

        var self = this;
        var result = this.lookupService.lookup(keys).then(function(map) {

            for(var i = 0; i < keys.length; ++i) {
                var key = keys[i];
                var item = items[i];

                var val = map.get(key);

                items[i] = self.mergeFn(item, val);
                //items[i] = mergeFn(item, val);
            }

            return items;
        });

        return result;
    }
});

module.exports = AugmenterLookup;
