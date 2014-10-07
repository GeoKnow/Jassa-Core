var Class = require('../../ext/Class');
var flatten = require('lodash.flatten');
var uniq = require('lodash.uniq');
var LookupServiceBase = require('../../service/lookup_service/LookupServiceBase');
var NodeFactory = require('../../rdf/NodeFactory');
var HashMap = require('../../util/collection/HashMap');

/**
 * The baseLookupService must return labels for rdf.Node objects
 *
 */
var LookupServicePathLabels = Class.create(LookupServiceBase, {
    initialize: function(lookupServiceBase) {
        this.lookupServiceBase = lookupServiceBase;
    },

    lookup: function(paths) {
        // Get all unique mentioned property names and turn them to jassa nodes
        var nodes = paths.map(function(path) {
            var r = path.getSteps().map(function(step) {
                return step.getPropertyName();
            });
            return r;
        });
        nodes = flatten(nodes);
        nodes = uniq(nodes);
        nodes = nodes.map(function(propertyName) {
            return NodeFactory.createUri(propertyName);
        });

        // Do a lookup with all the nodes
        var result = this.lookupServiceBase.lookup(nodes).then(function(map) {
            var r = new HashMap();
            paths.forEach(function(path) {
                var label = path.getSteps().reduce(function(memo, step) {
                    var result = memo;

                    var property = NodeFactory.createUri(step.getPropertyName());
                    var label = map.get(property);

                    result = result === '' ? result : result + '&raquo;';
                    result += label;
                    result = !step.isInverse() ? result : result + '&sup1';

                    return result;
                }, '');

                if (label === '') {
                    label = 'Items';
                }

                r.put(path, label);
            });

            return r;
        });

        return result;
    },
});

module.exports = LookupServicePathLabels;
