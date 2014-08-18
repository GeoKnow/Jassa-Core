//var Class = require('../../ext/Class');
//
//var FacetService = require('./FacetService');
//
///**
// * A FacetService is a factory for list services based on {jassa.facete.Path} objects.
// */
//
//var FacetService = Class.create({
//    initialize: function(facetService, itemTagger) {
//        this.facetService = facetService;
//        this.itemTagger 
//    },
//    
//    createListService: function(path, isInverse) { // TODO Maybe replace arguments with the PathHead object?
//        var ls = this.facetService.createListService(path, isInverse);
//        var result = new ListServiceTransformConcept(ls, fnTransform);
//        return result;
//    },
//
//});
//
//module.exports = FacetService;
//        pipeTagging: function(promise) {
//            var self = this;
//            
//            var result = promise.pipe(function(items) {
//                //ns.FacetTreeUtils.applyTags(items, self.pathTagger);
//                
//                _(items).each(function(item) {
//                    //self.pathTaggerManager.applyTags(item);
//                    //ns.FacetTreeUtils.applyTags(self.pathTaggerManager, item);
//                    var tags = self.pathTaggerManager.createTags(item.getPath());
//                    item.setTags(tags);
//                });
//                
//                return items;
//            });
//
//            return result;
//        },

