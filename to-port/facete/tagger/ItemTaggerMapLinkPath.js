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
    