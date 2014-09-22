var Step = require('./Step');
var Path = require('./Path');
var PathHead = require('./PathHead');

var shared = require('../util/shared');
var Promise = shared.Promise;


var FacetTreeServiceUtils = {//Class.create({
//    initialize: function(facetService) {
//        this.facetService = facetService;
//    },

    fetchFacetTree: function(facetService, facetTreeConfig, startPath) {
        startPath = startPath || new Path();

        var state = facetTreeConfig.getState(startPath);

        var es = state.getExpansionState();
        var filter = state.getListFilter();

        var pathHead;
        if (es > 0) {
            pathHead = new PathHead(startPath, false);
        } else if (es < 0) {
            pathHead = new PathHead(startPath, true);
        } else {
            pathHead = null;
        }

        var result;
        if(pathHead) {
            result = facetService.prepareListService(pathHead).then(function(listService) {
                return listService.fetchItems(filter.getConcept(), filter.getLimit(), filter.getOffset());
            }).then(function(facetEntries) {

                var facetInfos = facetEntries.map(function(entry) {
                    return entry.val;
                });
                /*
                var facetInfos = facetEntries.map(function(entry) {
                    var id = entry.key;
                    var r = entry.val;

                    // Create steps from the properties
                    var step = new Step(id.getUri(), pathHead.isInverse());
                    var subPath = startPath.copyAppendStep(step);

                    //r.id = subPath;
                    r.path = subPath;

                    return r;
                });
                */


                // Pluck the ID attributes
                var subPromises = facetInfos.map(function(facetInfo) {
                    //console.log('subPath:', JSON.stringify(facetEntries));

                    var subPath = facetInfo.path;
                    if(!subPath) {
                        throw new Error('Could not obtain a path for the sub facets of ' + JSON.stringify(facetInfo));
                    }

                    var r = FacetTreeServiceUtils.fetchFacetTree(facetService, facetTreeConfig, subPath);

                    return r;
                });


                var x = Promise.all(subPromises).then(function(children) {

                    facetInfos.forEach(function(facetInfo, i) {
                        var child = children[i];

                        if(pathHead.isInverse()) {
                            facetInfo.incoming = child;
                        } else {
                            facetInfo.outgoing = child;
                        }
                    });
                    return facetInfos;
                });

                return x;
            });
        } else {
            result = Promise.resolve([]);
        }

        return result;
    },

};


module.exports = FacetTreeServiceUtils;
