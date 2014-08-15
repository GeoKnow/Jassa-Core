var Class = require('../../ext/Class');
var LookupServiceBase = require('./lookup-service-base');
var LookupServicePathLabels = require('./lookup-service-path-labels');
var HashMap = require('../../util/hash-map');
var shared = require('../../util/shared');
var Promise = shared.Promise;

var LookupServiceConstraintLabels = Class.create(LookupServiceBase, {
    initialize: function(lookupServiceNodeLabels, lookupServicePathLabels) {
        this.lookupServiceNodeLabels = lookupServiceNodeLabels;
        this.lookupServicePathLabels = lookupServicePathLabels || new LookupServicePathLabels(lookupServiceNodeLabels);
    },

    lookup: function(constraints) {
        // Note: For now we just assume subclasses of ConstraintBasePathValue

        var paths = [];
        var nodes = [];

        constraints.forEach(function(constraint) {
            var cPaths = constraint.getDeclaredPaths();
            var cNode = constraint.getValue();

            paths.push.apply(paths, cPaths);
            nodes.push(cNode);
        });

        var p1 = this.lookupServiceNodeLabels.lookup(nodes);
        var p2 = this.lookupServicePathLabels.lookup(paths);

        var result = Promise.all([
            p1,
            p2,
        ]).then(function(nodeMap, pathMap) {
            var r = new HashMap();

            constraints.forEach(function(constraint) {
                var cPath = constraint.getDeclaredPath();
                var cNode = constraint.getValue();

                var pathLabel = pathMap.get(cPath);
                var nodeLabel = nodeMap.get(cNode);

                var cLabel = pathLabel + ' = ' + nodeLabel;
                r.put(constraint, cLabel);
            });

            return r;
        });

        return result;
    },
});

module.exports = LookupServiceConstraintLabels;
