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
    