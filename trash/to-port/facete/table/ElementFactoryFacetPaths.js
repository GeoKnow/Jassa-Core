    
    ns.ElementFactoryFacetPaths = Class.create({
        initialize: function(facetConfig, paths) {
            this.facetConfig = facetConfig;
            this.paths = paths || new util.ArrayList();
        },
        
        createElement: function() {
            var facetConceptGenerator = facete.FaceteUtils.createFacetConceptGenerator(this.facetConfig);
            var concept = facetConceptGenerator.createConceptResources(new facete.Path());

            var rootFacetNode = this.facetConfig.getRootFacetNode();
            
            
            var pathElements = _(this.paths).map(function(path) {
                var facetNode = rootFacetNode.forPath(path);
                
                console.log('facetNode: ', facetNode);
                
                var e = facetNode.getElements(true);
                
                
                // TODO On certain constraints affecting the path, we can skip the Optional
                var g = new sparql.ElementGroup(e);

                var r;
                if(e.length !== 0) {
                    r = new sparql.ElementOptional(g);
                }
                else {
                    r = g;
                }
                
                return r;
            });
                        
            var elements = [];
            elements.push.apply(elements, concept.getElements());
            elements.push.apply(elements, pathElements);
            
            var tmp = new sparql.ElementGroup(elements);
            
            var result = tmp.flatten();

            return result;
        }
    });

