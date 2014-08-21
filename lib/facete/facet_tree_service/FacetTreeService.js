var Class = require('../../ext/Class');

var Step = require('../Step');
var Path = require('../Path');
var PathHead = require('../PathHead');

var shared = require('../../util/shared');
var Promise = shared.Promise;


var FacetTreeService = {//Class.create({
//    initialize: function(facetService) {
//        this.facetService = facetService;
//    },

    fetchFacetTree: function(facetService, facetTreeConfig, startPath) {
        startPath = startPath || new Path();

        var state = facetTreeConfig.getState(startPath);

        var es = state.getExpansionState();

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
            result = facetService.createListService(pathHead).then(function(listService) {
                return listService.fetchItems(state.getFilter(), state.getLimit(), state.getOffset());
            }).then(function(facetInfos) {
                // Pluck the ID attributes
                var subPromises = facetInfos.map(function(facetInfo) {
                    var id = facetInfo.id;

                    // Create steps from the properties
                    var step = new Step(id.getUri(), pathHead.isInverse());
                    var subPath = startPath.copyAppendStep(step);

                    var r = FacetTreeService.fetchFacetTree(facetService, facetTreeConfig, subPath);

                    return r;
                });

                var x = Promise.all(subPromises).then(function(children) {
                    for(var i = 0; i < facetInfos.length; ++i) {
                        var facetInfo = facetInfos[i];
                        var child = children[i];

                        if(pathHead.isInverse()) {
                            facetInfo.incoming = child;
                        } else {
                            facetInfo.outgoing = child;
                        }
                    }
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


module.exports = FacetTreeService;
