(function() {
	
	var vocab = Jassa.vocab;
	
	var ns = Jassa.facete;

	
	
	// The three basic constraint types: mustExist, equals, and range.
	// Futhermore: bbox (multiple implementations possible, such as lat long or wktLiteral based)
	
	ns.ConstraintElementFactory = Class.create({
		createElementsAndExprs: function(rootFacetNode, constraintSpec) {
			throw "Override me";
		}
	});

	
//	ns.ConstraintElementFactoryTriplesBase = Class.create(ns.ConstraintElementFactory, {
//		createElementsAndExprs: function() {
//			
//		},
//		
//		createTriplesAndExprs: function() {
//			throw "Override me";
//		}
//	});
	

	ns.ConstraintElementFactoryExist = Class.create(ns.ConstraintElementFactory, {
		createElementsAndExprs: function(rootFacetNode, constraintSpec) {
			var facetNode = rootFacetNode.forPath(constraintSpec.getDeclaredPath());
			var elements = [new sparql.ElementTriplesBlock(facetNode.getTriples())];		
			var triplesAndExprs = new ns.ElementsAndExprs(elements, []);
			
			return result;
		}
	});
	
	
	/**
	 * constraintSpec.getValue() must return an instance of sparql.NodeValue
	 * 
	 */
	ns.ConstraintElementFactoryEqual = Class.create(ns.ConstraintElementFactory, {
		createElementsAndExprs: function(rootFacetNode, constraintSpec) {
			var facetNode = rootFacetNode.forPath(constraintSpec.getDeclaredPath());

			var pathVar = facetNode.getVar();
			
			var elements = [new sparql.ElementTriplesBlock(facetNode.getTriples())];		
			var exprs = [new sparql.E_Equals(pathVar, constraintSpec.getValue())]; //sparql.NodeValue.makeNode(constraintSpec.getValue()))];
			
			var result = new ns.ElementsAndExprs(elements, exprs);
			
			return result;
		}
	});
	
	
//	ns.ConstraintElementSparqlExpr = Class.create(ns.ConstraintElementFactory, {
//		createElement: function(rootFacetNode, constraintSpec) {
//			
//		}
//	});


	ns.ConstraintElementFactoryBBoxRange = Class.create(ns.ConstraintElementFactory, {
		initialize: function() {
			this.stepX = new facete.Step(vocab.wgs84.str.lon);
			this.stepY = new facete.Step(vocab.wgs84.str.la);
		},
		
		createElementsAndExprs: function(rootFacetNode, spec) {
			var facetNode = rootFacetNode.forPath(spec.getPath());
			var bounds = spec.getValue();
			
			var fnX = facetNode.forStep(this.stepX);
			var fnY = facetNode.forStep(this.stepY);

			var triplesX = fnX.getTriples();		
			var triplesY = fnY.getTriples();
			
			var triples = sparql.util.mergeTriples(triplesX, triplesY);
			
			//var element = new sparql.ElementTriplesBlock(triples);
			
			// Create the filter
			var varX = fnX.getVar();
			var varY = fnY.getVar();
			
			var expr = ns.createWgsFilter(vX, vY, this.bounds, xsd.xdouble);
			
			var elements = [new sparql.ElementTriplesBlock(triples)];
			var exprs = [expr];
			
			// Create the result
			var result = new ns.ElementsAndExprs(elements, exprs);
	
			return result;
		}		
	});
	
	

	/**
	 * constraintManager.addConstraint(new ConstraintBBox(path, bounds))
	 */	
//	ns.ConstraintBBox = Class.create(ns.PathExpr, {
//		initialize: function(path, bounds) {
//			
//		}
//	});
//	
//	
//	ns.ConstraintSparqlTransformer = Class.create({
//		
//	});
//	
	
	
	/*
	 * Wgs84 
	 */
		
	// TODO Should there be only a breadcrumb to the resource that carries lat/long
	// Or should there be two breadcrumbs to lat/long directly???
//	ns.PathConstraintWgs84 = function(pathX, pathY, bounds) {
//		this.pathX = pathX;
//		this.pathY = pathY;
//		this.bounds = bounds;
//
//		//this.long = "http://www.w3.org/2003/01/geo/wgs84_pos#long";
//		//this.lat = "http://www.w3.org/2003/01/geo/wgs84_pos#lat";
//	};
//	
//	
//	/**
//	 * This is a factory for arbitrary bbox constraints at a preset path.
//	 * 
//	 * @param path
//	 * @returns {ns.ConstraintWgs84.Factory}
//	 */
//	ns.PathConstraintWgs84.Factory = function(path, pathX, pathY) {
//		this.path = path;
//		this.pathX = pathX;
//		this.pathY = pathY;
//	};
//	
//	ns.PathConstraintWgs84.Factory.create = function(path) {
//		path = path ? path : new facets.Path();
//		
//		var pathX = path.copyAppendStep(new facets.Step(geo.lon.value)); //new ns.Breadcrumb.fromString(breadcrumb.pathManager, breadcrumb.toString() + " " + geo.long.value);
//		var pathY = path.copyAppendStep(new facets.Step(geo.lat.value)); ///new ns.Breadcrumb.fromString(breadcrumb.pathManager, breadcrumb.toString() + " " + geo.lat.value);
//
//		var result = new ns.PathConstraintWgs84.Factory(path, pathX, pathY);
//		return result;
//	};
//	
//	ns.PathConstraintWgs84.Factory.prototype = {
//		getPath: function() {
//			return this.path;
//		},
//	
//		/**
//		 * Note: bounds may be null
//		 */
//		createConstraint: function(bounds) {
//			return new ns.PathConstraintWgs84(this.pathX, this.pathY, bounds);
//		}
//	
//
////		getTriples: function(pathManager) {
////			var breadcrumbX = new facets.Breadcrumb(pathManager, this.pathX); 
////			var breadcrumbY = new facets.Breadcrumb(pathManager, this.pathY);
////			
////			var triplesX = breadcrumbX.getTriples();		
////			var triplesY = breadcrumbY.getTriples();
////			
////			var result = sparql.mergeTriples(triplesX, triplesY);
////			
////			return result;		
////		}
//	};
//
//	
//	ns.PathConstraintWgs84.prototype = {
//		createConstraintElementNewButNotUsedYet: function(breadcrumb) {
//			var path = breadcrumb.getPath();
//			
//			var pathX = path.copyAppendStep(new facets.Step(geo.lon.value));
//			var pathY = path.copyAppendStep(new facets.Step(geo.lat.value));
//	
//			// Create breadcrumbs
//			var breadcrumbX = new facets.Breadcrumb(pathManager, pathX); 
//			var breadcrumbY = new facets.Breadcrumb(pathManager, pathY);
//	
//			// Create the graph pattern
//			var triplesX = breadcrumbX.getTriples();		
//			var triplesY = breadcrumbY.getTriples();
//			
//			var triples = sparql.mergeTriples(triplesX, triplesY);
//			
//			//var element = new sparql.ElementTriplesBlock(triples);
//			
//			// Create the filter
//			var vX = breadcrumbX.getTargetVariable();
//			var vY = breadcrumbY.getTargetVariable();
//			
//			var expr = ns.createWgsFilter(vX, vY, this.bounds, xsd.xdouble);
//	
//			// Create the result
//			var result = new ns.ConstraintElement(triples, expr);
//	
//			return result;
//		},
//
//		getPath: function() {
//			return this.path;
//		},
//		
//		createElements: function(facetNode) {
//			var result = [];
//
//			// Create breadcrumbs
//			var facetNodeX = facetNode.forPath(this.pathX); 
//			var facetNodeY = facetNode.forPath(this.pathY);
//	
//			// Create the graph pattern
//			var triplesX = facetNodeX.getTriples();		
//			var triplesY = facetNodeY.getTriples();
//			
//			var triples = sparql.mergeTriples(triplesX, triplesY);
//
//			result.push(new sparql.ElementTriplesBlock(triples));
//			
//			if(!this.bounds) {
//				return result;
//			}
//			
//			//var element = new sparql.ElementTriplesBlock(triples);
//			
//			// Create the filter
//			var vX = facetNodeX.getVar();
//			var vY = facetNodeY.getVar();
//			
//			var expr = ns.createWgsFilter(vX, vY, this.bounds, xsd.xdouble);
//	
//			result.push(new sparql.ElementFilter([expr]));
//			
//			// Create the result
//			//var result = new ns.ConstraintElement(triples, expr);
//			return result;
//		}
//
////		createConstraintElement: function(pathManager) {
////			// Create breadcrumbs
////			var breadcrumbX = new facets.Breadcrumb(pathManager, this.pathX); 
////			var breadcrumbY = new facets.Breadcrumb(pathManager, this.pathY);
////	
////			// Create the graph pattern
////			var triplesX = breadcrumbX.getTriples();		
////			var triplesY = breadcrumbY.getTriples();
////			
////			var triples = sparql.mergeTriples(triplesX, triplesY);
////			
////			//var element = new sparql.ElementTriplesBlock(triples);
////			
////			// Create the filter
////			var vX = breadcrumbX.getTargetVariable();
////			var vY = breadcrumbY.getTargetVariable();
////			
////			var expr = ns.createWgsFilter(vX, vY, this.bounds, xsd.xdouble);
////	
////			// Create the result
////			var result = new ns.ConstraintElement(triples, expr);
////			return result;
////		}
//	};
//
	
})();