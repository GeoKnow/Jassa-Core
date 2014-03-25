(function() {

    var util = Jassa.util;
    
    var ns = Jassa.facete;


    /**
     * Tags all nodes in a facetTree, based on pathTaggers
     * 
     */
    ns.FacetTreeTagger = Class.create({
        initialize: function(pathTagger) {
            this.pathTagger = pathTagger;
        },
        
        applyTags: function(facetNode) {
            
            ns.FacetTreeUtils.applyTags(this.pathTagger, facetNode);
            
            return facetNode;
        }
    });
    

    ns.FacetTreeUtils = {
        //TODO Probably not used anymore
        applyTags: function(pathTagger, facetNode) {
            var facetNodes = util.TreeUtils.flattenTree(facetNode, 'children');
        
            _(facetNodes).each(function(node) {
                var path = node.item.getPath();
                var tags = pathTagger.createTags(path);
                _(node).extend(tags);
            });
            
            return facetNode;
        }
    };
    
    
    /**
     * Interface for retrieval of tags for a given object
     *
     */
    ns.ItemTagger = Class.create({
        createTags: function(item) {
            throw 'Not overidden';
        } 
    });

    
    /**
     * Item Tagger that aggregates a set of item taggers
     * 
     */
    ns.ItemTaggerManager = Class.create(ns.ItemTagger, {
        initialize: function() {
            this.taggerMap = {}
        },
        
        getTaggerMap: function() {
            return this.taggerMap;
        },
        
        /**
         * @param item The object for which to create the tags
         */
        createTags: function(item) {
            var result = {};
            _(this.taggerMap).each(function(tagger, key) {
                var tags = tagger.createTags(item);
                
                result[key] = tags;
            });
            
            return result;
        }
    });

    
    ns.ItemTaggerFilterString = Class.create(ns.ItemTagger, {
        initialize: function(pathToFilterString) {
            this.pathToFilterString = pathToFilterString;
        },
        
        createTags: function(path) {
            var filterString = this.pathToFilterString.get(path);
            //var isContained = paths.contains(path);
            
            var result = { filterString: filterString };
            //console.log('table: ' + path, isContained);
            return result;
        }
    });

    /**
     * Item Tagger for paths of whether they are linked as a table column
     * 
     */
    ns.ItemTaggerMembership = Class.create(ns.ItemTagger, {
        initialize: function(collection) {
            this.collection = collection;
        },
        
        createTags: function(item) {
            var isContained = this.collection.contains(item);
            
            var result = { isContained: isContained };
            //console.log('table: ' + path, isContained);
            return result;
        }
    });
    /*
    ns.PathTaggerFacetTableConfig = Class.create(ns.ItemTagger, {
        initialize: function(tableConfig) {
            this.tableMod = tableMod;
        },
        
        createTags: function(path) {
            var paths = this.tableMod.getPaths();
            var isContained = paths.contains(path);
            
            var result = { isContained: isContained };
            //console.log('table: ' + path, isContained);
            return result;
        }
    });
    */
    
    
    
    
    /**
     * Tags paths as active when they are in the collection of
     * active map links
     * 
     * TODO Apparently not used yet
     */
    ns.ItemTaggerMapLinkPath = Class.create(ns.ItemTagger, {
        initialize: function(mapLinkManager, conceptSpace) {
            this.mapLinkManager = mapLinkManager;
            this.conceptSpace = conceptSpace;
        },
        
        createTags: function(path) {
            var result = { isActive: isContained };
            return result;
        }
    });    
    

})();
