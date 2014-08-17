var TreeUtils = {

    /**
     * Generic method for visiting a tree structure
     *
     */
    visitDepthFirst: function(parent, fnChildren, fnPredicate) {
        var proceed = fnPredicate(parent);

        if (proceed) {
            var children = fnChildren(parent);

            children.forEach(function(child) {
                TreeUtils.visitDepthFirst(child, fnChildren, fnPredicate);
            });
        }
    },

    /**
     * Traverses a tree structure based on a child-attribute name and returns all nodes
     *
     */
    flattenTree: function(node, childPropertyName, result) {
        if (result == null) {
            result = [];
        }

        if (node) {
            result.push(node);
        }

        var children = node[childPropertyName];
        var self = this;
        if (children) {
            children.forEach(function(childNode) {
                self.flattenTree(childNode, childPropertyName, result);
            });
        }

        return result;
    },
};

module.exports = TreeUtils;
