(function() {
	
	var vocab = Jassa.vocab;
	var sparql = Jassa.sparql;
	var xsd = Jassa.xsd;
	var ns = Jassa.facete;

    /**
     * ConstraintSpecs can be arbitrary objects, however they need to expose the
     * declared paths that they affect.
     * DeclaredPaths are the ones part of spec, affectedPaths are those after considering the constraint's sparql element. 
     * 
     */
    ns.Constraint = Class.create({
        getName: function() {
            console.log('[ERROR] Override me');         
            throw 'Override me';
        },
        
        getDeclaredPaths: function() {
            console.log('[ERROR] Override me');
            throw 'Override me';
        },
        
        createElementsAndExprs: function(facetNode) {
            console.log('[ERROR] Override me');
            throw 'Override me';            
        },
        
        equals: function() {
              console.log('[ERROR] Override me');
            throw 'Override me';
        },
        
        hashCode: function() {
            console.log('[ERROR] Override me');
            throw 'Override me';
        }
    });
    

    /**
     * The class of constraint specs that are only based on exactly one path.
     * 
     * Offers the method getDeclaredPath() (must not return null)
     * Do not confuse with getDeclaredPaths() which returns the path as an array
     * 
     */
    ns.ConstraintBasePath = Class.create(ns.Constraint, {
        initialize: function(name, path) {
            this.name = name;
            this.path = path;
        },
        
        getName: function() {
            return this.name;
        },
        
        getDeclaredPaths: function() {
            return [this.path];
        },
        
        getDeclaredPath: function() {
            return this.path;
        }
    });


    /*
    ns.ConstraintBasePath = Class.create(ns.ConstraintBaseSinglePath, {
        initialize: function($super, name, path) {
            $super(name, path);
        }
    });
    */
    
    ns.ConstraintBasePathValue = Class.create(ns.ConstraintBasePath, {
        //classLabel: 'jassa.facete.ConstraintSpecPathValue',

        initialize: function($super, name, path, value) {
            $super(name, path);
            this.value = value;
        },

        getValue: function() {
            return this.value;
        },
        
        equals: function(that) {
            if(!that instanceof ns.ConstraintBasePathValue) {
                return false;
            }
            
            var a = this.name == that.name;
            var b = this.path.equals(that.path);
            var c = this.value.equals(that.value);
            
            var r = a && b &&c;
            return r;
        },
        
        hashCode: function() {
            var result = util.ObjectUtils.hashCode(this, true);
            return result;
        }
    });
	

    ns.ConstraintExists = Class.create(ns.ConstraintBasePath, {
        classLabel: 'jassa.facete.ConstraintExists',

        initialize: function($super, path) {
            $super('exists', path);
        },
        
        createElementsAndExprs: function(facetNode) {
            var result = ns.ConstraintUtils.createConstraintExists(facetNode, this.path);
            return result;
        }
    });

    
    ns.ConstraintLang = Class.create(ns.ConstraintBasePathValue, {
        classLabel: 'jassa.facete.ConstraintLang',
        
        initialize: function($super, path, langStr) {
            $super('lang', path, langStr);
        },
        
        createElementsAndExprs: function(facetNode) {
            var result = ns.ConstraintUtils.createConstraintLang(facetNode, this.path, this.value);
            return result;
        }
    });

    ns.ConstraintEquals = Class.create(ns.ConstraintBasePathValue, {
        classLabel: 'jassa.facete.ConstraintEquals',
        
        initialize: function($super, path, node) {
            $super('equals', path, node);
        },
        
        createElementsAndExprs: function(facetNode) {
            var result = ns.ConstraintUtils.createConstraintEquals(facetNode, this.path, this.value);
            return result;
        }
    });
    
    ns.ConstraintRegex = Class.create(ns.ConstraintBasePathValue, {
        classLabel: 'jassa.facete.ConstraintRegex',
        
        initialize: function($super, path, regexStr) {
            $super('regex', path, regexStr);
        },
        
        createElementsAndExprs: function(facetNode) {
            var result = ns.ConstraintUtils.createConstraintRegex(facetNode, this.path, this.regexStr);
            return result;
        }
    });
    
	
	
	// The three basic constraint types: mustExist, equals, and range.
	// Futhermore: bbox (multiple implementations possible, such as lat long or wktLiteral based)
	
	ns.ConstraintElementFactory = Class.create({
		createElementsAndExprs: function(rootFacetNode, constraintSpec) {
		    console.log('[ERROR] Override me');
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
/*
	ns.ConstraintElementFactoryExist = Class.create(ns.ConstraintElementFactory, {
		createElementsAndExprs: function(rootFacetNode, constraintSpec) {
		    var result = ns.ConstraintUtils.createExists(rootFacetNode, constraint)
		}
	});
*/

	/*
    ns.ConstraintElementFactoryLang = Class.create(ns.ConstraintElementFactory, {
        createElementsAndExprs: function(rootFacetNode, constraintSpec) {
            var facetNode = rootFacetNode.forPath(constraintSpec.getDeclaredPath());

            var pathVar = facetNode.getVar();
            var exprVar = new sparql.ExprVar(pathVar);

            var elements = sparql.ElementUtils.createElementsTriplesBlock(facetNode.getTriples());

            // NOTE Value is assumed to be node holding a string, maybe check it here
            var val = constraintSpec.getValue().getLiteralValue();

            var exprs = [new sparql.E_LangMatches(new sparql.E_Lang(exprVar), val)];
            
            var result = new ns.ElementsAndExprs(elements, exprs);
            
            //console.log('constraintSpec.getValue() ', constraintSpec.getValue());
            return result;
        }
    });
*/
	/*
    ns.ConstraintElementFactoryRegex = Class.create(ns.ConstraintElementFactory, {
        createElementsAndExprs: function(rootFacetNode, constraintSpec) {
            var facetNode = rootFacetNode.forPath(constraintSpec.getDeclaredPath());

            var pathVar = facetNode.getVar();
            var exprVar = new sparql.ExprVar(pathVar);
            
            //var elements = [new sparql.ElementTriplesBlock(facetNode.getTriples())];
            var elements = sparql.ElementUtils.createElementsTriplesBlock(facetNode.getTriples());
    
            //var valueExpr = constraintSpec.getValue();
            //var valueExpr = sparql.NodeValue.makeNode(constraintSpec.getValue());
            
            // NOTE Value is assumed to be node holding a string, maybe check it here
            var val = constraintSpec.getValue().getLiteralValue();
    
    
            var exprs = [new sparql.E_Regex(exprVar, val, 'i')];
            
            var result = new ns.ElementsAndExprs(elements, exprs);
            
            //console.log('constraintSpec.getValue() ', constraintSpec.getValue());
            return result;
        }
    });
*/
	
	/**
	 * constraintSpec.getValue() must return an instance of sparql.NodeValue
	 * 
	 */
/*	
	ns.ConstraintElementFactoryEqual = Class.create(ns.ConstraintElementFactory, {
		createElementsAndExprs: function(rootFacetNode, constraintSpec) {
			var facetNode = rootFacetNode.forPath(constraintSpec.getDeclaredPath());

			var pathVar = facetNode.getVar();
			var exprVar = new sparql.ExprVar(pathVar);
			
			//var elements = [new sparql.ElementTriplesBlock(facetNode.getTriples())];
			var elements = sparql.ElementUtils.createElementsTriplesBlock(facetNode.getTriples());
	
			//var valueExpr = constraintSpec.getValue();
			var valueExpr = sparql.NodeValue.makeNode(constraintSpec.getValue());
	
	
			var exprs = [new sparql.E_Equals(exprVar, valueExpr)];
			
			var result = new ns.ElementsAndExprs(elements, exprs);
			
			//console.log('constraintSpec.getValue() ', constraintSpec.getValue());
			return result;
		}
	});
*/	
	
//	ns.ConstraintElementSparqlExpr = Class.create(ns.ConstraintElementFactory, {
//		createElement: function(rootFacetNode, constraintSpec) {
//			
//		}
//	});


	ns.ConstraintElementFactoryBBoxRange = Class.create(ns.ConstraintElementFactory, {
		initialize: function() {
			this.stepX = new ns.Step(vocab.wgs84.str.lon);
			this.stepY = new ns.Step(vocab.wgs84.str.lat);
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
			
			var expr = ns.createWgsFilter(varX, varY, this.bounds, xsd.xdouble);
			
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