    
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

    
    ns.SparqlServiceFactoryDefault = Class.create({
        initialize: function() {
            this.hashToCache = {};
        },
        
        createSparqlService: function(sparqlServiceIri, defaultGraphIris) {
            var tmp = new ns.SparqlServiceHttp(sparqlServiceIri, defaultGraphIris);
            tmp = new ns.SparqlServiceCache(tmp);
            
            var hash = tmp.getStateHash();
            
            var cacheEntry = this.hashToCache[hash];
            
            var result;
            if(cacheEntry) {
                result = cacheEntry;                
            } else {
                this.hashToCache[hash] = tmp;
                result = tmp;
            }
            
            return result;
        }
    });
