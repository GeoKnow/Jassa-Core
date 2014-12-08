var Class = require('../../ext/Class');

var UpdateData = require('./UpdateData');

var UpdateInsertData = Class.create(UpdateData, {
    initialize: function($super, quads) {
        $super(quads);
    },

    toString: function($super) {
        var result = 'Insert Data { ' + $super() + ' }';
        return result;
    }
});

module.exports = UpdateInsertData;
