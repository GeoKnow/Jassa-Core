var NodeUtils = {

    getSubstitute:s function(node, fnNodeMap) {
        var result = fnNodeMap(node);
        if (!result) {
            result = node;
        }

        return result;
    },

};

module.exports = NodeUtils;