var xsd = require('../vocab/xsd');
var NodeFactory = require('../rdf/NodeFactory');
var Binding = require('./Binding');

var BindingUtils = {

    cloneBinding: function(binding) {
        var result = new Binding();
        var entries = binding.entries();
        entries.forEach(function(entry) {
            // TODO Replace with entry.key and entry.val
            result.put(entry.v, entry.node);
        });

        return result;
    },

    cloneBindings: function(bindings) {
        var result = bindings.map(function(binding) {
            var r = BindingUtils.cloneBinding(binding);
            return r;
        });

        return result;
    },

    /**
     * In place-addition of an 'index' mapping.
     *
     * @param bindings
     * @param v
     * @param offset
     * @returns
     */
    addRowIds: function(bindings, v, offset) {
        offset = offset || 0;

        bindings.forEach(function(binding, index) {
            var i = offset + index;
            var node = NodeFactory.createTypedLiteralFromString('' + i, xsd.xinteger);
            binding.put(v, node);
        });

        return bindings;
    },
};

module.exports = BindingUtils;
