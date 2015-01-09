var uniq = require('lodash.uniq');

var NodeFactory = require('../rdf/NodeFactory');

var PathUtils = {
    getUris: function(path) {
        var propertyUris = path.map(function(step) {
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
