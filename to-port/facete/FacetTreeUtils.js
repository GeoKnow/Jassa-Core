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