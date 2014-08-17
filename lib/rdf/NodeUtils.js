var NodeUtils = {

    getSubstitute: function(node, fnNodeMap) {
        var result = fnNodeMap(node);
        if (!result) {
            result = node;
        }

        return result;
    },

    /**
     * Push the node into to the array if it is a variable
     */
    pushVar: function(array, node) {
        if (node.isVariable()) {
            var c = false;
            array.forEach(function(item) {
                c = c || node.equals(item);
            });

            if (!c) {
                array.push(node);
            }
        }
        return array;
    },

    getLang: function(node) {
        return null;
    },
    
    // Turn a node of any kind into a javascript literal value
    getValue: function(node) {
        return null;
    },

};

module.exports = NodeUtils;