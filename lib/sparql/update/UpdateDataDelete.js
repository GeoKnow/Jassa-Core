var Class = require('../../ext/Class');

var UpdateData = require('./UpdateData');

var UpdateDeleteData = Class.create(UpdateData, {
    initialize: function($super, quads) {
        $super(quads);
    },

    toString: function($super) {
        var result = 'Delete Data { ' + $super() + ' }';
        return result;
    }
});

module.exports = UpdateDeleteData;
