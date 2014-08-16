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
        
