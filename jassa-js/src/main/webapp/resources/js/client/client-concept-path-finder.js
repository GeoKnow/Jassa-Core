(function($) {
    
    var ns = Jassa.client;

    /**
     * Client wrapper for an API that searches for property paths
     * connecting a source concept to a target concept.
     * 
     */
    ns.ConceptPathFinderApi = Class.create({
        initialize: function(apiUrl, sparqlServiceIri, defaultGraphIris) {
            this.apiUrl = apiUrl;
            this.sparqlServiceIri = sparqlServiceIri;
            this.defaultGraphIris = defaultGraphIris;
        },
    
        findPaths: function(sourceConcept, targetConcept) {
            var ajaxSpec = {
                url: this.apiUrl,
                dataType: 'json',
                crossDomain: true,
                data: {
                    'service-uri': this.sparqlServiceIri,
                    'default-graph-uri': this.defaultGraphIris,
                    'source-element': sourceConcept.getElement().toString(),
                    'source-var':  sourceConcept.getVar().getName(),
                    'target-element': targetConcept.getElement().toString(),
                    'target-var': targetConcept.getVar().getName()
                }
            };

            //console.log('[DEBUG] Path finding ajax spec', ajaxSpec);
            
            var result = $.ajax(ajaxSpec).pipe(function(pathStrs) {
                var result = [];
                
                for(var i = 0; i < pathStrs.length; ++i) {
                    var pathStr = pathStrs[i];
                    
                    //console.log("pathStr is", pathStr);
                    
                    var path = facete.Path.parse(pathStr);
                    result.push(path);
                }
                
                return result;
            });
            
            return result;
        },
        
        findPathsOldApi: function(sourceConcept, targetConcept) {
            
            var querySpec = {
                    service: {
                        serviceIri: this.sparqlServiceIri,
                        defaultGraphIris: this.defaultGraphIris
                    },
                    sourceConcept: {
                        elementStr: sourceConcept.getElement().toString(),
                        varName: sourceConcept.getVar().value
                    },
                    targetConcept: {
                        elementStr: targetConcept.getElement().toString(),
                        varName: targetConcept.getVar().value
                    }
            };
            
            var ajaxSpec = {
                url: this.apiUrl,
                dataType: 'json',
                data: {
                    query: JSON.stringify(querySpec)
                }
            };

            //console.log('[DEBUG] Path finding ajax spec', ajaxSpec);
            
            var result = $.ajax(ajaxSpec).pipe(function(pathStrs) {
                var result = [];
                
                for(var i = 0; i < pathStrs.length; ++i) {
                    var pathStr = pathStrs[i];
                    
                    //console.log("pathStr is", pathStr);
                    
                    var path = facete.Path.parse(pathStr);
                    result.push(path);
                }
                
                return result;
            });
            
            return result;
        }
    });
    
})(jQuery);
