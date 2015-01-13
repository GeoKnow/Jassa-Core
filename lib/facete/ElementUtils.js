var FacetUtils = require('./FacetUtils');
var ElementGroup = require('../sparql/element/ElementGroup');
var ElementOptional = require('../sparql/element/ElementOptional');
var Path = require('./Path');

var ElementUtils = {


    /**
     * Creates an element based on the given paths,
     * where each path can be considered as mapped to a column in a table
     *
     */
    createElementTable: function(facetConfig, paths) {
        //var facetConceptGenerator = facete.FaceteUtils.createFacetConceptGenerator(this.facetConfig);
        //var concept = facetConceptGenerator.createConceptResources(new facete.Path());
        var concept = FacetUtils.createConceptResources(facetConfig, new Path(), false);


        var rootFacetNode = facetConfig.getRootFacetNode();


        var pathElements = paths.map(function(path) {
            var facetNode = rootFacetNode.forPath(path);

            //console.log('facetNode: ', facetNode);

            var e = facetNode.getElements(true);


            // TODO On certain constraints affecting the path, we can skip the Optional
            var g = new ElementGroup(e);

            var r;
            if(e.length !== 0) {
                r = new ElementOptional(g);
            }
            else {
                r = g;
            }

            return r;
        });

        var elements = [];
        elements.push.apply(elements, concept.getElements());
        elements.push.apply(elements, pathElements);

        var tmp = new ElementGroup(elements);

        var result = tmp.flatten();

        return result;
    }
};

module.exports = ElementUtils;

