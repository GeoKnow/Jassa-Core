(function() {
	
	var ns = Jassa.facete;

	ns.QueryFactory = Class.create({
		createQuery: function() {
			throw "Not overridden";
		}
	});


	/**
	 * A query factory that injects facet constraints into an arbitrary query returned by
	 * a subQueryFactory.
	 * 
	 * 
	 * 
	 */
	ns.QueryFactoryFacets = Class.create(ns.QueryFactory, {
		initialize: function(subQueryFactory, rootFacetNode, constraintManager) {
			this.subQueryFactory = subQueryFactory;
			this.rootFacetNode = rootFacetNode;
			this.constraintManager = constraintManager ? constraintManager : new ns.ConstraintManager();
		},
	
		getRootFacetNode: function() {
			return this.rootFacetNode;
		},
			
		getConstraintManager: function() {
			return this.constraintManager;
		},
			
		createQuery: function() {
			var query = this.subQueryFactory.createQuery();

			if(query == null) {
				return null;
			}
			
			//var varsMentioned = query.getVarsMentioned();
			var varsMentioned = query.getProject();//.getVarList();
			

			var varNames = _.map(varsMentioned, function(v) {
				return v.value;
			});
			
			
			var elements = this.constraintManager.createElements(this.rootFacetNode);
			query.elements.push.apply(query.elements, elements);
			
			return query;
		}	
	});


	ns.QueryFactoryFacets.create = function(subQueryFactory, rootVarName, generator) {
    // FIXME: facets.GenSym cannot be resolved
		generator = generator ? generator : new facets.GenSym("fv");
		var rootFacetNode = facets.FacetNode.createRoot(rootVarName, generator);
		
		var result = new ns.QueryFactoryFacets(subQueryFactory, rootFacetNode);

		return result;
	};

	
})();
