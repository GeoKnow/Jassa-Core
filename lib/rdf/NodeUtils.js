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
        var result;
        if(node == null) {
            result = null;
        } else if(node.isUri()) {
            result = node.getUri();
        } else if(node.isBlank()) {
            result = node.toString();
        } else if(node.isLiteral()) {
            result = node.getLiteralValue();
        } else {
            throw new Error('Unknow node type: ', node);
        }
        
        return result;
    },

};

module.exports = NodeUtils;