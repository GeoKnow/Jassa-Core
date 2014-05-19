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
		generator = generator ? generator : new facets.GenSym("fv");
		var rootFacetNode = facets.FacetNode.createRoot(rootVarName, generator);
		
		var result = new ns.QueryFactoryFacets(subQueryFactory, rootFacetNode);

		return result;
	};

	
	
//	ns.ConstraintNode = function(facetNode, parent) {
//		this.facetNode = facetNode;
//		this.parent = parent;
//		
//		this.idToConstraint = {};
//	};
//

//	ns.SparqlDataflow = function(query, fnPostProcessor) {
//		this.query = query;
//		this.fnPostProcessor = fnPostProcessor;
//	};
//	
//	ns.SparqlDataflow.prototype = {
//		createDataProvider: function(sparqlServer) {
//
//			var executor = new facets.ExecutorQuery(sparqlService, query);
//			var result = new DataProvider(executor);
//			
//			// TODO Attach the postProcessing workflow
//			
//			return result;
//		}
//	};	
	
//	ns.ElementDesc = Class.create({
//		initialize: function(element, focusVar, facetVar) {
//			this.element = element;
//			this.focusVar = focusVar;
//			this.facetVar = facetVar;
//		},
//
//		createConcept: function() {
//			var result = new facets.ConceptInt(this.element, this.facetVar);
//			return result;
//		},
//		
//		createQueryFacetValueCounts: function() {
//			var element = this.element;
//			
//			var focusVar = this.focusVar;
//			var facetVar = this.facetVar;
//
//			var sampleLimit = null;
//							
//			countVar = countVar ? countVar : sparql.Node.v("__c");
//			var result = queryUtils.createQueryCount(element, sampleLimit, focusVar, countVar, [facetVar], options);
//			
//			return result;
//		},
//		
//		createQueryFacetValues: function() {
//			var element = this.element;
//							
//			var focusVar = this.focusVar;
//			var facetVar = this.facetVar;
//
//			var sampleLimit = null;
//			
//			countVar = countVar ? countVar : sparql.Node.v("__c");
//			var result = queryUtils.createQueryCountDistinct(element, sampleLimit, focusVar, countVar, [facetVar], options);
//
//			return result;
//		}
//	});
	
	
})();
