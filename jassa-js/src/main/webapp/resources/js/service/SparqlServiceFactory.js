(function() {
    
    var ns = Jassa.service;
    
    ns.SparqlServiceFactory = Class.create({
        createSparqlService: function() {
            throw 'Not overridden';
        }
    });
    
    
    /**
     * 
     * 
     * 
     */
    ns.SparqlServiceFactoryConst = Class.create({
        initialize: function(sparqlService) {
            this.sparqlService = sparqlService;
        },
        
        createSparqlService: function() {
            var result = this.sparqlService;
            
            if(result == null) {
                console.log('[ERROR] Creation of a SPARQL service requested, but none was provided');
                throw 'Bailing out';
            }
            
            return result;
        },
        
        setSparqlService: function(sparqlService) {
            this.sparqlService = sparqlService;
        }
    });

})();