    
    /**
     * 
     * 
     * TODO Possibly rename to FaceteConfigUtils
     */
    ns.FaceteUtils = {
            createFacetConceptGenerator: function(facetConfig) {
                var baseConcept = facetConfig.getBaseConcept();
                var rootFacetNode = facetConfig.getRootFacetNode();
                var constraintManager = facetConfig.getConstraintManager();
                
                var result = this.createFacetConceptGenerator2(baseConcept, rootFacetNode, constraintManager);
                return result;
            },
            
            createFacetConceptGenerator2: function(baseConcept, rootFacetNode, constraintManager) {
                // Based on above objects, create a provider for the configuration
                // which the facet service can build upon
                var facetConfigProvider = new ns.FacetGeneratorConfigProviderIndirect(
                    new ns.ConceptFactoryConst(baseConcept),
                    new ns.FacetNodeFactoryConst(rootFacetNode),
                    constraintManager
                );
                
                var fcgf = new ns.FacetConceptGeneratorFactoryImpl(facetConfigProvider);
                var result = fcgf.createFacetConceptGenerator();
                
                return result;
            },
            
//            createFacetService: function(facetConfig) {
//                var result = this.createFacetService2(facetConfig.);
//            },
//            
            createFacetService: function(sparqlService, facetConfig) {
                var facetConceptGenerator = this.createFacetConceptGenerator(facetConfig);

                //labelMap = labelMap || sponate.SponateUtils.createDefaultLabelMap();
                
                var facetService = new ns.FacetServiceImpl(sparqlService, facetConceptGenerator, facetConfig.getLabelMap(), facetConfig.getPathTaggerManager());

                return facetService;
            },
            
            
            
            createFacetTreeService: function(sparqlService, facetTreeConfig) {


                var facetService = this.createFacetService(sparqlService, facetTreeConfig.getFacetConfig());
                
                var expansionSet = facetTreeConfig.getExpansionSet();
                var expansionMap = facetTreeConfig.getExpansionMap();
                var facetStateProvider = facetTreeConfig.getFacetStateProvider();
                var pathToFilterString = facetTreeConfig.getPathToFilterString();
                

                var facetTreeService = new ns.FacetTreeServiceImpl(facetService, expansionSet, expansionMap, facetStateProvider, pathToFilterString);

                return facetTreeService;

                //var constraintTaggerFactory = new ns.ConstraintTaggerFactory(constraintManager);       
                
                
                //var faceteConceptFactory = new ns.ConceptFactoryFacetService(facetService);
                
                
                //var result = new ns.ConceptSpace(facetTreeService);
                
                //return result;            
            },
            
            createFacetTreeTagger: function(pathToFilterString) {
                //var tableMod = new ns.FaceteTableMod(); 
                //tableMod.togglePath(new ns.Path());
                
                
                var pathTagger = new ns.ItemTaggerManager();
                //pathTagger.getTaggerMap()['table'] = new ns.ItemTaggerTablePath(tableMod);
                pathTagger.getTaggerMap()['filter'] = new ns.ItemTaggerFilterString(pathToFilterString);
                var facetTreeTagger = new ns.FacetTreeTagger(pathTagger);
                
                return facetTreeTagger;
            }

        };
