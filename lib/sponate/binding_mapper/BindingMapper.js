var Class = require('../../ext/Class');

var BindingMapper = Class.create({
    map: function(binding, rowId) {
        throw new Error('Not overridden');
    }
});

module.exports = BindingMapper;
