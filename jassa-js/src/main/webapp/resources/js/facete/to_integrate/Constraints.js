/**
 * Constraint classes for the facet system.
 * Essentially they support the generation of SPARQL predicate expressions
 * based on facet path expressions. 
 * 
 * 
 * TODO In general, constraints are more complex than just being compiled to SPARQL predicates:
 * The new model should be as follows:
 * - A constraint is always associated with a specific path or set of paths.
 * - This means, that a constraint affects a set of SPARQL variables.
 * - A constraint may be compiled to SPARQL, but - and here comes the clue:
 * - A constraint may perform post processing on the query result!
 * 
 * constraint.getSparqlElement();
 * constraint.getPostProcessor();
 *  
 * Note that post processors are evaluated on the client.
 * The workflow is as follows: First the SPARQL query is generated based on all constraints.
 * Then, for each focus resource, the corresponding path elements are fetched.
 * 
 *    TODO: Does a post processor only work on the end-nodes of a path? 
 *    We may have to extend the path language to allow aliases:
 *    "memberOfWay georrs{polygon}"
 *    getPostProcessor(
 *  
 */
(function($) {

	var xsd = Namespace("org.aksw.ssb.vocabs.xsd");
	
	var sparql = Namespace("org.aksw.ssb.sparql.syntax");
	var geo = Namespace("org.aksw.ssb.vocabs.wgs84");
	var collections = Namespace("org.aksw.ssb.collections");
	var facets = Namespace("org.aksw.ssb.facets");

	var ns = Namespace("org.aksw.ssb.facets");
	
	
	/*
	 * Regex
	 */

	ns.ConstraintRegex = function(regexStr, flags) {
		this.regexStr = regexStr;
		this.flags = flags;
	};
	
	ns.ConstraintRegex.prototype = {
			toString: function() {
				return "regex(" + this.regexStr + ", " + this.flags + ")";
			},
	
			/**
			 * TODO: This should become the new createExpr function
			 * 
			 * @param v
			 * @returns {sparql.E_Regex}
			 */
			createExprVar: function(v) {
				var varExpr = new sparql.ExprVar(variable); 		
				var result = new sparql.E_Regex(varExpr, this.regexStr, this.flags);

				return result;				
			},
			
			createExpr: function(breadcrumb) {
		
				var variable = breadcrumb.getTargetVariable();
				
				var result = createExprVar(variable);
				
				return result;
			}
	};
	
	/*
	ns.ConstraintRegex.prototype.createConstraintElement = function(pathManager) {
		var breadcrumb = new facets.Breadcrumb(pathManager, this.path); 
		
		var triples = breadcrumb.getTriples();
		
		var varExpr = new sparql.ExprVar(breadcrumb.getTargetVariable()); 		
		var expr = new sparql.E_Regex(varExpr, this.regexStr, this.flags);
		
		
		
		var result = new ns.ConstraintElement(triples, expr);
		return result;
	};
	*/

	
	/*
	 * Equals
	 * 
	 * FIXME Maybe the nodeValue should be generalized to expr
	 */
	
	ns.ConstraintEquals = function(nodeValue) {
		//this.path = path;
		this.nodeValue = nodeValue;
	};
	
	/*
	ns.ConstraintEquals.prototype.getPath = function() {
		return this.path;
	};
	*/
	
	ns.ConstraintEquals.prototype.getNodeValue = function() {
		return this.nodeValue;
	};
	
	ns.ConstraintEquals.prototype.toString = function() {
		return " = " + this.nodeValue;
	};
	
	
	// TODO Move to appropriate location
	ns.numericDatatypes = {'http://www.w3.org/2001/XMLSchema#float': true, 'http://www.w3.org/2001/XMLSchema#double': true};
	
	ns.isNumericDatatype = function(datatype) {
		return ns.numericDatatypes[datatype];
	};
	
	
	/**
	 * 
	 * 
	 * 
	 * @param breadcrumb
	 * @returns {sparql.E_Equals}
	 */
	ns.ConstraintEquals.prototype.createExpr = function(breadcrumb) {
		
		var variable = breadcrumb.getTargetVariable();
		
		var result = this.createExprByVar(variable);
		return result;
	},

	/*
	ns.ConstraintEquals.prototype.createElement = function(variable) {
		var result = new facets.ElementGroup(
				[
        ]);
		
	},
	*/

	
	ns.ConstraintEquals.prototype.createExprByVar = function(variable) {
		
		
		var varExpr = new sparql.ExprVar(variable); 		

		//if(this.nodeValue.datatype)
		var result;
		
		var node = this.nodeValue.node;
		var datatype = node.datatype;
		//console.log("Datatype is ", datatype, this.nodeValue.node);
		
		if(ns.isNumericDatatype(datatype)) { 
			var v = parseFloat(node.value);
			var eps = 0.00001;
			var min = v - eps;
			var max = v + eps;
			
			var result =
				new sparql.E_LogicalAnd(
						new sparql.E_GreaterThan(
								varExpr,
								new sparql.NodeValue(sparql.Node.typedLit(min, datatype))
						),
						new sparql.E_LessThan(
								varExpr,
								new sparql.NodeValue(sparql.Node.typedLit(max, datatype))
						)
				);
		} else {
			result = new sparql.E_Equals(varExpr, this.nodeValue);
		}
		

		return result;
	};
	
	/*
	ns.ConstraintEquals.prototype.createConstraintElement = function(pathManager) {
		var breadcrumb = new facets.Breadcrumb(pathManager, this.path); 
		
		var triples = breadcrumb.getTriples();
		
		var varExpr = new sparql.ExprVar(breadcrumb.getTargetVariable()); 		
		var expr = new sparql.E_Equals(varExpr, this.nodeValue);
		
		
		
		var result = new ns.ConstraintElement(triples, expr);
		return result;
	};
	*/

	/*
	ns.ConstraintEquals.prototype.getExpr = function(pathManager) {
		
		
	};
	
	ns.ConstraintEquals.prototype.getTriples = function(pathManager, generator) {
		var result = this.breadcrumb.getTriples();
		
		return result;
		//var result = new sparql.ElementTriplesBlock(breadcrumb.getTriples());
	};
	*/

	
	
	ns.ConstraintOgc = function(path, bounds) {
		this.path = path;
		this.bounds = bounds;
	};
	
	ns.ConstraintOgc.createExpr = function(breadcrumb) {
		var variable = breadcrumb.getTargetVariable();
		var varExpr = new sparql.ExprVar(variable);
	};

	
	ns.ConstraintOgcFactory = function(path) {
		this.path = path ? path : new facets.Path();
	};
	
	ns.ConstraintOgcFactory.getPath = function() {
		return this.path;
	};
	
	ns.ConstraintOgcFactory.prototype.create = function(bounds) {
		return new ns.PathConstraint(this.path, ns.ConstraintWkt(bounds));
	};
	
	
	
	
		
	/*
	ns.ConstraintWgs84.prototype.getExpr = function() {
		//var node = this.breadcrumb.targetNode; //this.pathManager.getNode(this.pathStr);
		
		//var nodeX = node.getOrCreate(this.long);
		//var nodeY = node.getOrCreate(this.lat);
		
		var vX = sparql.Node.v(this.breadcrumbX.targetNode.variable);
		var vY = sparql.Node.v(this.breadcrumbY.targetNode.variable);
		
		var result = ns.createWgsFilter(vX, vY, this.bounds);
		
		return result;
	};
	
	ns.ConstraintWgs84.prototype.getElement = function() {
		//var pathStrX = this.pathStr + " " + this.long;
		//var pathStrY = this.pathStr + " " + this.lat;
		
		//var triplesX = this.breadcrumb.pathManager.toTriples(pathStrX);		
		//var triplesY = this.breadcrumb.pathManager.toTriples(pathStrY);
		var triplesX = this.breadcrumbX.getTriples();		
		var triplesY = this.breadcrumbY.getTriples();
		
		var result = sparql.mergeTriples(triplesX, triplesY);
		
		return result;
	};
	*/

	
//	ns.ElementFactoryConcept = function(concept) {
//		this.concept = concept;
//	}
//	
//	ns.ElementFactoryElements.prototype = {
//		createElements: function() {
//			return this.concept.getElements();
//		}
//	};
//
	
	ns.GeoConceptFactoryCombine = function(featureConcept, geoConceptFactory) {
		this.featureConcept = featureConcept;
		this.geoConceptFactory = geoConceptFactory;
	};

	ns.GeoConceptFactoryCombine.prototype = {
			getGeomVar: function() {
				return this.geoConceptFactory.getVar();
			},
			
			getFeatureVar: function() {
				return this.featureConcept.getVar();
			},
			
			getFeatureConcept: function() {
				return this.featureConcept;
			},
			
			getGeoConceptFactory: function() {
				return this.geoConceptFactory;
			},
			
			combineConcepts: function(geoConcept) {
				var geoVar = geoConcept.getVar();
				
				var tmpConcept = facets.createCombinedConcept(this.featureConcept, geoConcept);
				
				var element = tmpConcept.getElement();
				var result = new facets.ConceptInt(element, geoVar);
								
				return result;
			},
			
			createConcept: function(bounds) {
				var geoConcept = this.geoConceptFactory.createConcept(bounds);
				
				var rawResult = this.combineConcepts(geoConcept);
				
				var result = rawResult.createOptimizedConcept();
				
				//console.log('Create the combinedConcept with bounds: ', this.geoConceptFactory);
				
				return result;
			}
	};
	
	ns.GeoConceptFactory = function(facetNode, pathConstraintFactory) {
		this.facetNode = facetNode;
		this.pathConstraint = pathConstraintFactory;
	};
	
	ns.GeoConceptFactory.prototype = {
			createConstraint: function(bounds) {
				var result = this.pathConstraint.createConstraint(bounds);
				return result;
			},
			
			createElements: function(bounds) {
				var constraint = this.createConstraint(bounds);
				var result = constraint.createElements(this.facetNode);
				
				return result;
			},
			
			getVar: function() {
				var node = this.facetNode.forPath(this.pathConstraint.getPath());
				var result = node.getVar();

				return result;
			},
			
			createConcept: function(bounds) {
				var v = this.getVar();
				
				var elements = this.createElements(bounds);
				
				var result = facets.ConceptInt.createFromElements(elements, v);
				
				return result;
			}
	};
	
	
	
	
})(jQuery);
