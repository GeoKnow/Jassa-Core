
    
    
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
        