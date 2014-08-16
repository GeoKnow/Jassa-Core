(function() {
	
	var ns = Jassa.facete;
	
	ns.FacetNodeFactory = Class.create({
		createFacetNode: function() {
			throw "Override me";
		}
	});
	
	
	ns.FacetNodeFactoryConst = Class.create(ns.FacetNodeFactory, {
		initialize: function(facetNode) {
			this.facetNode = facetNode;
		},

		createFacetNode: function() {
			return this.facetNode;
		}
	});
	
})();