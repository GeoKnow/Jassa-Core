/*
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
*/   