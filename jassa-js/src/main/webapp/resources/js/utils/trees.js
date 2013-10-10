(function() {
	
	var ns = Jassa.utils.collections;
	
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
		}
			
	};
	
})();
