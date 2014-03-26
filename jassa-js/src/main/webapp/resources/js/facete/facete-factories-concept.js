(function() {

    
    var sparql = Jassa.sparql;
    
	var ns = Jassa.facete;

	
	/**
	 * Wrapper that returns the element of 'factored' concepts
	 */
	ns.ElementFactoryConceptFactory = Class.create(sparql.ElementFactory, {
	    initialize: function(conceptFactory) {
	        this.conceptFactory = conceptFactory;
	    },
	    
	    createElement: function() {
	        var concept = this.conceptFactory.createConcept();
	        var result = concept ? concept.getElement() : null;
	        
	        return result;
	    }
	});
	    

	
	ns.ConceptFactory = Class.create({
		createConcept: function() {
			throw "not overridden";
		}
	});


	ns.ConceptFactoryConst = Class.create(ns.ConceptFactory, {
		initialize: function(concept) {
			this.concept = concept;
		},
		
		getConcept: function() {
			return this.concept;
		},
		
		setConcept: function(concept) {
			this.concept = concept;
		},
		
		createConcept: function() {
			return this.concept;
		}
	});
		
	ns.ConceptFactoryFacetConfig = Class.create(ns.ConceptFactory, {
	    initialize: function(facetConfig, path, excludeSelfConstraints) {
	        this.facetConfig = facetConfig;
	        this.path = path || new facete.Path();
	        this.excludeSelfConstraints = excludeSelfConstraints;
	    },
	    
	    createConcept: function() {
	        var facetConceptGenerator = ns.FaceteUtils.createFacetConceptGenerator(this.facetConfig);
	        var result = facetConceptGenerator.createConceptResources(this.path, this.excludeSelfConstraints);	        
	        return result;
	    }
	});

	ns.ConceptFactoryFacetTreeConfig = Class.create(ns.ConceptFactory, {
        initialize: function(facetTreeConfig, path, excludeSelfConstraints) {
            this.facetTreeConfig = facetTreeConfig;
            this.path = path || new facete.Path();
            this.excludeSelfConstraints = excludeSelfConstraints;
        },
        
        setPath: function(path) {
            this.path = path;
        },
        
        getPath: function() {
            return this.path;
        },
        
        getFacetTreeConfig: function() {
            return this.facetTreeConfig;
        },
        
        setFacetTreeConfig: function(facetTreeConfig) {
            this.facetTreeConfig = facetTreeConfig;
        },

        isExcludeSelfConstraints: function() {
            return this.excludeSelfConstraints;
        },
        
        setExcludeSelfConstraints: function(excludeSelfConstraints) {
            this.excludeSelfConstraints = excludeSelfConstraints;
        },
        
        createConcept: function() {
            var facetConfig = this.facetTreeConfig.getFacetConfig();
            
            var facetConceptGenerator = ns.FaceteUtils.createFacetConceptGenerator(facetConfig);
            var result = facetConceptGenerator.createConceptResources(this.path, this.excludeSelfConstraints);          
            return result;
        }	
	});
	
	
	/*
    ns.ConceptFactoryFacetService = Class.create(ns.ConceptFactory, {
        initialize: function(facetService) {
            this.facetService = facetService;
        },
        
        createConcept: function() {
            var result = this.facetService.createConceptFacetValues(new facete.Path());
            return result;
        }
    });
	 */

})();
