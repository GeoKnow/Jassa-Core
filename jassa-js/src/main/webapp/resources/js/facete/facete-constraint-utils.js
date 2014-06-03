(function() {
	
    var vocab = Jassa.vocab;
    var sparql = Jassa.sparql;
    
    var ns = Jassa.facete;
	
	
	ns.ElementsAndExprs = Class.create({
		initialize: function(elements, exprs) {
			this.elements = elements;
			this.exprs = exprs;
		},
		
		getElements: function() {
			return this.elements;
		},
		
		getExprs: function() {
			return this.exprs;
		},
		
		toElements: function() {
		    var result = [];
		    
		    var filterElements = sparql.ElementUtils.createFilterElements(this.exprs);

		    result.push.apply(result, this.elements);
		    result.push.apply(result, filterElements);
		    
		    return result;
		}
	});

	
    
    ns.ConstraintUtils = {
        createConstraintExists: function(rootFacetNode, path) {

            var facetNode = rootFacetNode.forPath(path);
            var elements = sparql.ElementUtils.createElementsTriplesBlock(facetNode.getTriples());
            var triplesAndExprs = new ns.ElementsAndExprs(elements, []);
            
            return result;
        },
        
        createConstraintLang: function(rootFacetNode, path, langStr) {
            var facetNode = rootFacetNode.forPath(path);

            var pathVar = facetNode.getVar();
            var exprVar = new sparql.ExprVar(pathVar);

            var elements = sparql.ElementUtils.createElementsTriplesBlock(facetNode.getTriples());

            // NOTE Value is assumed to be node holding a string, maybe check it here
            var val = langStr; //constraintSpec.getValue().getLiteralValue();

            var exprs = [new sparql.E_LangMatches(new sparql.E_Lang(exprVar), val)];
            
            var result = new ns.ElementsAndExprs(elements, exprs);
            
            //console.log('constraintSpec.getValue() ', constraintSpec.getValue());
            return result;
        },
        
        createConstraintRegex: function(rootFacetNode, path, str) {
            var facetNode = rootFacetNode.forPath(path);

            var pathVar = facetNode.getVar();
            var exprVar = new sparql.ExprVar(pathVar);
            
            //var elements = [new sparql.ElementTriplesBlock(facetNode.getTriples())];
            var elements = sparql.ElementUtils.createElementsTriplesBlock(facetNode.getTriples());
    
            //var valueExpr = constraintSpec.getValue();
            //var valueExpr = sparql.NodeValue.makeNode(constraintSpec.getValue());
            
            // NOTE Value is assumed to be node holding a string, maybe check it here
            var val = str; //constraintSpec.getValue().getLiteralValue();
    
    
            var exprs = [new sparql.E_Regex(exprVar, val, 'i')];
            
            var result = new ns.ElementsAndExprs(elements, exprs);
            
            //console.log('constraintSpec.getValue() ', constraintSpec.getValue());
            return result;
        },
        
        createConstraintEquals: function(rootFacetNode, path, node) {
            var facetNode = rootFacetNode.forPath(path);

            var pathVar = facetNode.getVar();
            var exprVar = new sparql.ExprVar(pathVar);
            
            //var elements = [new sparql.ElementTriplesBlock(facetNode.getTriples())];
            var elements = sparql.ElementUtils.createElementsTriplesBlock(facetNode.getTriples());
    
            //var valueExpr = constraintSpec.getValue();
            var valueExpr = sparql.NodeValue.makeNode(node); //constraintSpec.getValue());
    
    
            var exprs = [new sparql.E_Equals(exprVar, valueExpr)];
            
            var result = new ns.ElementsAndExprs(elements, exprs);
            
            //console.log('constraintSpec.getValue() ', constraintSpec.getValue());
            return result;
        }
    };
    	
	
	/**
	 * @Deprecated in favor of the more generic ElementsAndExprs
	 * 
	 * A class that - as the name states - combines triples and exprs.
	 *
	 *
	 *
	 * Additionally provides a createElements to turn its state into an array of sparql elements.
	 * 
	 */
//	ns.TriplesAndExprs = Class.create({
//		initialize: function(triples, exprs) {
//			this.triples = triples;
//			this.exprs = exprs;
//		},
//		
//		getTriples: function() {
//			return this.triples;
//		},
//		
//		getExprs: function() {
//			return this.exprs;
//		},
//		
//		createElements: function() {
//			var triples = this.triples;
//			var exprs = this.exprs;
//
//			var result = [];
//
//			if(triples && triples.length > 0) {
//				result.push(new sparql.ElementTriplesBlock(triples));
//			}
//			
//			if(exprs && exprs.length > 0) {
//				result.push(new sparql.ElementFilter(exprs))
//				/*
//				var filters = _(exprs).map(function(expr) {
//					return new sparql.ElementFilter(expr);
//				});
//				*/
//			}
//			
//			return result;
//		}
//	});
	
	
})();