(function() {

	var rdf = Jassa.rdf;
	var vocab = Jassa.vocab;
	var sparql = Jassa.sparql;
	
	var ns = Jassa.facete;

	ns.QueryUtils = {
		
//		createTripleRdfProperties: function(propertyVar) {
//			var result = new rdf.Triple(propertyVar, vocab.rdf.type, vocab.rdf.Property);
//			return result;
//		},

//		createElementRdfProperties: function(propertyVar) {
//			var triple = this.createTripleRdfProperties(propertyVar);
//			var result = new sparql.ElementTriplesBlock([triple]);
//			return result;
//		},
	
		
		
		createElementsFacet: function(concept, isInverse, facetVar, valueVar) {
			var result = [];
			
			// If the concept is isomorph to (?s ?p ?o , ?s), skip it because we are going to add the same triple
			if(!concept.isSubjectConcept()) {
				var elements = concept.getElements();
				result.push.apply(result, elements);
			}
			
			var s = concept.getVariable();
			var p = facetVar;
			var o = valueVar;
		
			var triples = isInverse
				? [ new rdf.Triple(o, p, s) ]
				: [ new rdf.Triple(s, p, o) ];
			
			var triplesBlock = new sparql.ElementTriplesBlock(triples);
			
			result.push(triplesBlock);
			
			return result;
		},
	
		/**
		 * Select ?facetVar (Count(Distinct(?__o)) As ?countFacetVar) { }
		 * 
		 */
		createQueryFacetCount: function(concept, facetVar, countFacetVar, isInverse, sampleSize) {
	
			//var facetVar = sparql.Node.v("__p");
			var valueVar = sparql.Node.v("__o");
			var elements = ns.createElementsFacet(concept, isInverse, facetVar, valueVar);
			
			var result = ns.createQueryCount(element, sampleSize, valueVar, countFacetVar, [facetVar], true);
	
			return result;
		},

		
//		createElementSubQuery: function(elements, limit, offset) {
//			if(limit == null && offset == null) {
//				return elements;
//			}
//			
//			var subQuery = new sparql.Query();
//			
//			var subQueryElements = subQuery.getElements();
//			subQueryElements.push.apply(subQueryElements, elements);
//
//			//subQuery.setResultStar(true);
//			subQuery.setLimit(limit);
//			subQuery.setOffset(offset);
//			
//			var resultElement = new sparql.ElementSubQuery(subQuery);			
//
//			return resultElement;
//		},
			
//			if(groupVars) {
//				for(var i = 0; i < groupVars.length; ++i) {					
//					var groupVar = groupVars[i];					
//					subQuery.projectVars.add(groupVar);
//					//subQuery.groupBy.push(groupVar);
//				}
//			}
//			
//			if(variable) {
//				subQuery.projectVars.add(variable);
//			}
//			
//			if(subQuery.projectVars.vars.length === 0) {
//		    	subQuery.isResultStar = true;
//			}
//			
//			subQuery.limit = limit;
//			
//			result.getElements().push(new sparql.ElementSubQuery(subQuery));			
//			} else {
//				var resultElements = result.getElements();
//				resultElements.push.apply(resultElements, elements);
//			}
//		},

        /**
         * Creates a query with
         * Select (Count(*) As outputVar) {{ Select Distinct ?variable { element } }} 
         * 
         */		
        createQueryCount: function(elements, limit, variable, outputVar, groupVars, useDistinct, options) {

            var exprVar = variable ? new sparql.ExprVar(variable) : null;

            var varQuery = new sparql.Query();
            if(limit) {
                var subQuery = new sparql.Query();
                
                var subQueryElements = subQuery.getElements();
                subQueryElements.push.apply(subQueryElements, elements); //element.copySubstitute(function(x) { return x; }));
    
                if(groupVars) {
                    for(var i = 0; i < groupVars.length; ++i) {                 
                        var groupVar = groupVars[i];                    
                        subQuery.projectVars.add(groupVar);
                        //subQuery.groupBy.push(groupVar);
                    }
                }
                
                if(variable) {
                    subQuery.projectVars.add(variable);
                }
                
                if(subQuery.projectVars.vars.length === 0) {
                    subQuery.isResultStar = true;
                }
                
                subQuery.limit = limit;
                
                varQuery.getElements().push(new sparql.ElementSubQuery(subQuery));            
            } else {
                var varQueryElements = varQuery.getElements();
                varQueryElements.push.apply(varQueryElements, elements);
            }
            
            //result.groupBy.push(outputVar);
            /*
            if(groupVars) {
                _(groupVars).each(function(groupVar) {
                    varQuery.getProjectVars().add(groupVar);
                    varQuery.getGroupBy().push(new sparql.ExprVar(groupVar));
                });
            }
            */
            
            varQuery.setDistinct(useDistinct);
            if(variable) {
                varQuery.getProjectVars().add(variable)
            } else {
                varQuery.setResultStar(true);
            }

            var elementVarQuery = new sparql.ElementSubQuery(varQuery);
            
            var result = new sparql.Query();
            
            if(groupVars) {
                _(groupVars).each(function(groupVar) {
                    result.getProjectVars().add(groupVar);
                    result.getGroupBy().push(new sparql.ExprVar(groupVar));
                });
            }
            
            result.getProjectVars().add(outputVar, new sparql.E_Count());
            result.getElements().push(elementVarQuery);
            
            //exp, new sparql.E_Count(exprVar, useDistinct));
            //ns.applyQueryOptions(result, options);
            
            
            
    //debugger;
            //console.log("Created count query:" + result + " for element " + element);
            return result;
        },
        
        
		/**
		 * Creates a query with Count(Distinct ?variable)) As outputVar for an element.
		 * 
		 */
		createQueryCountDoesNotWorkWithVirtuoso: function(elements, limit, variable, outputVar, groupVars, useDistinct, options) {
	
			
			var exprVar = variable ? new sparql.ExprVar(variable) : null;
			
			var result = new sparql.Query();
			if(limit) {
				var subQuery = new sparql.Query();
				
				var subQueryElements = subQuery.getElements();
				subQueryElements.push.apply(subQueryElements, elements); //element.copySubstitute(function(x) { return x; }));
	
				if(groupVars) {
					for(var i = 0; i < groupVars.length; ++i) {					
						var groupVar = groupVars[i];					
						subQuery.projectVars.add(groupVar);
						//subQuery.groupBy.push(groupVar);
					}
				}
				
				if(variable) {
					subQuery.projectVars.add(variable);
				}
				
				if(subQuery.projectVars.vars.length === 0) {
			    	subQuery.isResultStar = true;
				}
				
				subQuery.limit = limit;
				
				result.getElements().push(new sparql.ElementSubQuery(subQuery));			
			} else {
				var resultElements = result.getElements();
				resultElements.push.apply(resultElements, elements);
			}
			
			//result.groupBy.push(outputVar);
			if(groupVars) {
				_(groupVars).each(function(groupVar) {
					result.getProjectVars().add(groupVar);
					result.getGroupBy().push(new sparql.ExprVar(groupVar));
				});
			}
			
			result.getProjectVars().add(outputVar, new sparql.E_Count(exprVar, useDistinct));
			//ns.applyQueryOptions(result, options);
			
	//debugger;
			//console.log("Created count query:" + result + " for element " + element);
			return result;
		}
	};

})();
