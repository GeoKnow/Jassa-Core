var Class = require('../ext/QuadTree');
var QuadTreeNode = require('./QuadTreeNode');

/**
 * A LooseQuadTree data structure.
 *
 * @param bounds Maximum bounds (e.g. (-180, -90) - (180, 90) for spanning the all wgs84 coordinates)
 * @param maxDepth Maximum depth of the tree
 * @param k The factor controlling the additional size of nodes in contrast to classic QuadTrees.
 * @returns {QuadTree}
 */
var QuadTree = Class.create({
    initialize: function(bounds, maxDepth, k) {
        if(k == null) {
            k = 0.25;
        }

        this.node = new QuadTreeNode(null, bounds, maxDepth, 0, k);

        // Map in which nodes objects with a certain ID are located
        // Each ID may be associated with a set of geometries
        this.idToNodes = [];
    },

    getRootNode: function() {
        return this.node;
    },

    /**
     * Retrieve the node that completely encompasses the given bounds
     *
     *
     * @param bounds
     */
    aquireNodes: function(bounds, depth) {
        return this.node.aquireNodes(bounds, depth);
    },


    query: function(bounds, depth) {
        return this.node.query(bounds, depth);
    },

    insert: function(item) {

    }
});


module.exports = QuadTree;
