var Class = require('../../ext/Class');

var QuadUtils = require('../../sparql/QuadUtils');

var UpdateData = Class.create({
    initialize: function(quads) {
        this.quads = quads || [];
    },

    toString: function($super) {
        var result = '' + QuadUtils.quadsToElement(this.quads);
        return result;
    }
});

module.exports = UpdateData;
