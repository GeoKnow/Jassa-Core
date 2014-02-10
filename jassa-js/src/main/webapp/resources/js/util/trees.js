(function() {
	
	var ns = Jassa.util;
	
	ns.TreeUtils = {
		
		/**
		 * Generic method for visiting a tree structure
		 * 
		 */
		visitDepthFirst: function(parent, fnChildren, fnPredicate) {
			var proceed = fnPredicate(parent);
			
			if(proceed) {
				var children = fnChildren(parent);
				
				_(children).each(function(child) {
					ns.TreeUtils.visitDepthFirst(child, fnChildren, fnPredicate);
				});
			}
		},
		
	    /**
	     * Traverses a tree structure based on a child-attribute name and returns all nodes
	     * 
	     */
	    flattenTree: function(node, childPropertyName, result) {
	        if(result == null) {
	            result = [];
	        }
	        
	        if(node) {
	            result.push(node);
	        }
	        
	        var children = node[childPropertyName];
	        var self = this;
	        if(children) {
	            _(children).each(function(childNode) {
	                self.flattenTree(childNode, childPropertyName, result);
	            });
	        }
	        
	        return result;
	    }
			
	};
	
})();
