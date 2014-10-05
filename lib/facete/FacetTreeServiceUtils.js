var FacetTreeService = require('./facet_tree_service/FacetTreeService');
var HashMap = require('../util/collection/HashMap');
var FacetServiceBuilder = require('./FacetServiceBuilder');
var FacetNodeState = require('./FacetNodeState');


var FacetTreeServiceUtils = {

    createFacetTreeService: function(sparqlService, facetTreeConfig) {


        var facetConfig = facetTreeConfig.getFacetConfig();
        //var tagMap = new HashMap();
        var pathToTags = facetTreeConfig.getPathToTags();

        //var pathToState = facetTreeConfig.getPathToState();

        var tagFn = function(entry) {
            var userFn = facetTreeConfig.getTagFn();
            if(userFn) {
                entry = userFn(entry);
            }

//            var key = entry.key;

//            var state = pathToState.get(key);
//            if(!state) {
//                state = new FacetNodeState();
//                pathToState.put(key, state);
//            }
//
//            entry.val.tags.state = state;
            return entry;
        };

        //var facetService = new facete.FacetServiceUtils.createFacetService(sparqlService, facetConfig, tagMap.asFn());
        var facetService = FacetServiceBuilder
            .core(sparqlService, facetConfig)
            .labelConfig()
            .index()
            .pathToTags(pathToTags)
            .tagFn(tagFn)
            .create();

        //var result = new FacetTreeService(facetService, pathToState.asFn());
        var result = new FacetTreeService(facetService, facetTreeConfig.getFacetTreeState());

        return result;
    }
};


module.exports = FacetTreeServiceUtils;
