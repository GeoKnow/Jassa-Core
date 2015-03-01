var uniq = require('lodash.uniq');

var NodeFactory = require('../rdf/NodeFactory');

var FacetNode = require('./FacetNode');
var VarUtils = require('../sparql/VarUtils');
var ElementUtils = require('../sparql/ElementUtils');
var Relation = require('../sparql/Relation');

var PathUtils = {
    createRelation: function(path, sourceVar) {
        sourceVar = sourceVar || VarUtils.s;
        var facetNode = FacetNode.createRoot(sourceVar);

        var fn = facetNode.forPath(path);
        var tmp = fn.getElements();

        var element = ElementUtils.groupIfNeeded(tmp);

        //var sourceVar = facetNode.getVar();
        var targetVar = fn.getVar();

        var result = new Relation(element, sourceVar, targetVar);
        return result;
    },


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
