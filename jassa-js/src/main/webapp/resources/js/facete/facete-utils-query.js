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
			
			var result = ns.createQueryCount(elements, sampleSize, valueVar, countFacetVar, [facetVar], true);
	
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
         * With group vars it may become Select ?g1 ... ?gn Count(Distinct?s))
         * 
         * ISSUE The limit so far acts as a scan limit - it limits the result rows of the element
         *       But it does not affect the number of resources considered
         * If no variable is given, the query 
         */		
        createQueryCount: function(elements, limit, variable, outputVar, groupVars, useDistinct, options) {

            var exprVar = variable ? new sparql.ExprVar(variable) : null;

            
            var queryPattern;

            var needsSubQuery = limit || useDistinct || (groupVars && groupVars.length > 0); 
            if(needsSubQuery) {

                var subQuery = new sparql.Query();
                var subQueryElements = subQuery.getElements();
                subQueryElements.push.apply(subQueryElements, elements); //element.copySubstitute(function(x) { return x; }));
                
                if(groupVars) {
                    for(var i = 0; i < groupVars.length; ++i) {                 
                        var groupVar = groupVars[i];                    
                        subQuery.getProject().add(groupVar);
                        //subQuery.groupBy.push(groupVar);
                    }
                }
                
                if(variable) {
                    subQuery.getProject().add(variable);
                }
                
                if(subQuery.getProjectVars().length === 0) {
                    subQuery.setResultStar(true);
                }

                subQuery.setDistinct(useDistinct);
                subQuery.setLimit(limit);
                
                queryPattern = new sparql.ElementSubQuery(subQuery);
            } else {
                queryPattern = new sparql.ElementGroup(elements);
            }
                      
                        
            
            var result = new sparql.Query();
            result.setQueryPattern(queryPattern);
            
            if(groupVars) {
                _(groupVars).each(function(groupVar) {
                    result.getProject().add(groupVar);
                    result.getGroupBy().push(new sparql.ExprVar(groupVar));
                });
            }

            result.getProject().add(outputVar, new sparql.E_Count());

            return result;
            
            // Note Virtuoso has a bug that
            // TODO Add the fix to SparqlServiceVirtFix for that
            // Select Count(*) { ... } Limit 1000 will prevent from counting beyond 1000 (the limit should only limit the result set after counting to at most 10000 lines) 

            /*
            var tmp = new sparql.Query();
            tmp.setQueryPattern(new sparql.ElementSubQuery(result));
//            if(variable) {
//                tmp.getProject().add(outputVar);
//            } else {
                tmp.setResultStar(true);
//            }

            return tmp;
//            *
            //return result;

            
            /*
            if(variable) {
                varQuery.getProject().add(variable)
            } else {
                varQuery.setResultStar(true);
            }
            */
            
            
            /*
            else {
                varQuery = new sparql.Query();
                //varQuery.getElements().push(new sparql.ElementSubQuery(subQuery));            

                var varQueryElements = varQuery.getElements();
                varQueryElements.push.apply(varQueryElements, elements);
            }
            */
            
            //result.groupBy.push(outputVar);

            //var elementVarQuery = new sparql.ElementSubQuery(varQuery);
            
            
            
            //exp, new sparql.E_Count(exprVar, useDistinct));
            //ns.applyQueryOptions(result, options);
            
            
            
    //debugger;
            //console.log("Created count query:" + result + " for element " + element);
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
			    	subQuery.setResultStar(true);
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
					result.getProject().add(groupVar);
					result.getGroupBy().push(new sparql.ExprVar(groupVar));
				});
			}
			
			result.getProject().add(outputVar, new sparql.E_Count(exprVar, useDistinct));
			//ns.applyQueryOptions(result, options);
			
	//debugger;
			//console.log("Created count query:" + result + " for element " + element);
			return result;
		}
	};

})();
