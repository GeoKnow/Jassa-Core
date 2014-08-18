var Class = require('../../ext/Class');
var BindingMapper = require('./BindingMapper');

var BindingMapperIndex = Class.create(BindingMapper, {
//    initialize: function() {
//    },

    map: function(binding, rowId) {
        return rowId;
    },

});

module.exports = BindingMapperIndex;
