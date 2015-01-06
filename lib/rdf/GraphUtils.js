var HashSet = require('../util/collection/HashSet');

var GraphUtils = {
    /**
     * Filter prefixes by those that can be actually applied to the resources
     * of a given graph
     *
     * The result is an array of unique strings
     */
    extractUris: function(graph) {
        var set = new HashSet();
        graph.forEach(function(triple) {
            triple.toArray().forEach(function(node) {
                if(node != null && node.isUri()) {
                    set.add(node.getUri());
                }
            });
        });

        var result = set.entries();
        return result;
    },

};

module.exports = GraphUtils;
