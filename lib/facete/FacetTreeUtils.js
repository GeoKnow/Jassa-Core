var Step = require('./Step');
var Path = require('./Path');
var PathHead = require('./PathHead');

var shared = require('../util/shared');
var Promise = shared.Promise;


var FacetTreeUtils = {//Class.create({
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
            result = facetService.createListService(pathHead).then(function(listService) {
                return listService.fetchItems(filter.getConcept(), filter.getLimit(), filter.getOffset());
            }).then(function(facetEntries) {
                // Pluck the ID attributes
                var subPromises = facetEntries.map(function(facetEntry) {
                    var id = facetEntry.key;
console.log('id: ' + id);
                    // Create steps from the properties
                    var step = new Step(id.getUri(), pathHead.isInverse());
                    var subPath = startPath.copyAppendStep(step);

                    var r = FacetTreeUtils.fetchFacetTree(facetService, facetTreeConfig, subPath);

                    return r;
                });

                var facetInfos = facetEntries.map(function(entry) {
                    return entry.val;
                });

                var x = Promise.all(subPromises).then(function(children) {
console.log('children: ', JSON.stringify(children));
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


module.exports = FacetTreeUtils;
