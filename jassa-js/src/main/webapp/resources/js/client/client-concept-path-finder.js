(function($) {
    
    var service = Jassa.service;
    var ns = Jassa.client;


    /**
     * Client wrapper for an API that searches for property paths
     * connecting a source concept to a target concept.
     * 
     */
    ns.ConceptPathFinderApi = Class.create({
        initialize: function(apiUrl, sparqlServiceIri, defaultGraphIris, joinSummaryServiceIri, joinSummaryGraphIris) {
            this.apiUrl = apiUrl;
            this.sparqlServiceIri = sparqlServiceIri;
            this.defaultGraphIris = defaultGraphIris;
            
            // TODO Path finding options and strategy should go into generic attributes
            //this.nPaths = nPaths;
            //this.maxHops = maxHops;
            
            this.joinSummaryServiceIri = joinSummaryServiceIri;
            this.joinSummaryGraphIris = joinSummaryGraphIris;
        },

        createAjaxConfig: function() {
			var result = {
                'service-uri': this.sparqlServiceIri,
                'default-graph-uri': this.defaultGraphIris,
                'source-element': sourceConcept.getElement().toString(),
                'source-var':  sourceConcept.getVar().getName(),
                'target-element': targetConcept.getElement().toString(),
                'target-var': targetConcept.getVar().getName(),
                'js-service-uri': this.joinSummaryServiceIri,
                'js-graph-uri': this.joinSummaryGraphIris
                //'n-paths': this.nPaths,
                //'max-hops': this.maxHops
            };

			return result;
        },

        createSparqlService: function() {
			var data = this.createAjaxConfig();

            // TODO How can we turn the ajax spec into a (base) URL?

			var result = new service.SparqlServiceHttp(this.apiUrl, [], null, data);
			return result;
        },

        findPaths: function(sourceConcept, targetConcept) {
			var data = this.createAjaxConfig();

            var ajaxSpec = {
                url: this.apiUrl,
                dataType: 'json',
                crossDomain: true,
                traditional: true, // Serializes JSON arrays by repeating the query string paramater
				data: data
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
