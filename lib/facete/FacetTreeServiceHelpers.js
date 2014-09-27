var Step = require('./Step');
var Path = require('./Path');
var PathHead = require('./PathHead');

var shared = require('../util/shared');
var Promise = shared.Promise;

var FacetNodeState = require('./FacetNodeState');


var FacetTreeServiceHelpers = {//Class.create({
//    initialize: function(facetService) {
//        this.facetService = facetService;
//    },

    fetchFacetTree: function(facetService, pathToStateFn) {
        var result = FacetTreeServiceHelpers.fetchFacetTreeRec(facetService, pathToStateFn, null)
            .then(function(facets) {
                var r = facets[0];
                return r;
            });

        return result;
    },

    /**
     * Note: This method actually fetches the *sub*Facets at a given path
     * If the startPath is null, conceptually the children of the 'superRoot' facets are returned,
     * which is an array containing solely the 'root' facet.
     */
    fetchFacetTreeRec: function(facetService, pathToStateFn, startPath) {
        // startPath must not be undefined, but may be null to indicate the root facet
        startPath = startPath || null;
        var state = pathToStateFn(startPath);

        //console.log('startPath: ' + startPath + ', state: ' + JSON.stringify(state));
        state = state || new FacetNodeState();

        var es = state.getExpansionState();
        var filter = state.getListFilter();

        var pathHead = null;
        if(startPath) {
            if (es > 0) {
                pathHead = new PathHead(startPath, false);
            } else if (es < 0) {
                pathHead = new PathHead(startPath, true);
            }
        }

        var result;
        if(es !== 0) {
            result = facetService.prepareListService(pathHead).then(function(listService) {
                return listService.fetchItems(filter.getConcept(), filter.getLimit(), filter.getOffset());
            }).then(function(facetEntries) {

                var facetInfos = facetEntries.map(function(entry) {
                    return entry.val;
                });

                // Pluck the ID attributes
                var subPromises = facetInfos.map(function(facetInfo) {
                    //console.log('subPath:', JSON.stringify(facetEntries));

                    var subPath = facetInfo.path;
                    if(!subPath) {
                        throw new Error('Could not obtain a path for the sub facets of ' + JSON.stringify(facetInfo));
                    }

                    var r = FacetTreeServiceHelpers.fetchFacetTreeRec(facetService, pathToStateFn, subPath);

                    return r;
                });


                var x = Promise.all(subPromises).then(function(children) {

                    facetInfos.forEach(function(facetInfo, i) {
                        var child = children[i];

                        if(pathHead && pathHead.isInverse()) {
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


module.exports = FacetTreeServiceHelpers;
