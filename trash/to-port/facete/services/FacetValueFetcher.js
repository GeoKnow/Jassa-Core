   
    ns.FacetValueFetcher = Class.create({
                
        initialize: function(baseFlow, facetTreeConfig, path) {
            this.baseFlow = baseFlow;
            this.facetTreeConfig = facetTreeConfig;
            this.path = path;
        },
        
        fetchCount: function() {
            var countPromise = this.baseFlow.count();
            return countPromise;
        },
        
        fetchData: function(offset, limit) {
            
            var dataFlow = this.baseFlow.skip(offset).limit(limit);

            var self = this;

            var dataPromise = dataFlow.asList(true).pipe(function(docs) {
                var path = self.path;
                
                var facetConfig = self.facetTreeConfig.getFacetConfig();
                var constraintTaggerFactory = new ns.ConstraintTaggerFactory(facetConfig.getConstraintManager());
                
                var tagger = constraintTaggerFactory.createConstraintTagger(path);
                
                var r = _(docs).map(function(doc) {
                    // TODO Sponate must support retaining node objects
                    //var node = rdf.NodeFactory.parseRdfTerm(doc.id);
                    var node = doc.id;
                    
                    var label = doc.displayLabel ? doc.displayLabel : '' + doc.id;
                    //console.log('displayLabel', label);
                    var tmp = {
                        displayLabel: label,
                        path: path,
                        node: node,
                        tags: tagger.getTags(node)
                    };

                    return tmp;
                    
                });

                return r;
            });
            
            return dataPromise;
        }
    });
