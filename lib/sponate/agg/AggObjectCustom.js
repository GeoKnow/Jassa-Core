var Class = require('../../ext/Class');
var AggObject = require('./AggObject');

var AggObjectCustom = Class.create(AggObject, {
    initialize: function($super, attrToAgg, templateParser) {
        $super(attrToAgg);
        this.templateParser = templateParser;
    },

    add: function(attrName, obj) {
        var agg = this.templateParser.parseAgg(obj);

        this.attrToAgg[attrName] = agg;

        return agg;
    },

    del: function(attrName) {
        delete this.attrToAgg[attrName];
    }
});

module.exports = AggObjectCustom;
