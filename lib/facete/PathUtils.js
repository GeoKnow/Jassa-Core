var uniq = require('lodash.uniq');

var NodeFactory = require('../rdf/NodeFactory');

var PathUtils = {
    getUris: function(path) {
        var steps = path ? path.getSteps(): [];

        var propertyUris = steps.map(function(step) {
            return step.getPropertyName();
        });

        propertyUris = uniq(propertyUris);

        var result = propertyUris.map(function(propertyUri) {
            var r = NodeFactory.createUri(propertyUri);
            return r;
        });

        return result;
    }
};


module.exports = PathUtils;
