var HashSet = require('../util/collection/HashSet');
var HashMap = require('../util/collection/HashMap');

var GraphImpl = require('./GraphImpl');

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

    indexBySubject: function(graph, result) {
        result = result || new HashMap();

        // Partition the graph returned by the request by the subjects
        graph.forEach(function(triple) {
            var s = triple.getSubject();
            var subGraph = result.get(s);
            if(!subGraph) {
                subGraph = new GraphImpl();
                result.put(s, subGraph);
            }

            subGraph.add(triple);
        });

        return result;
    }
};

module.exports = GraphUtils;
