(function() {
	
	var sparql = Jassa.sparql;
	
	var rdf = Jassa.rdf;

	var ns = Jassa.facete;

	
	/**
	 * Returns a new array of those triples, that are directly part of the given array of elements.
	 * 
	 */
	ns.getElementsDirectTriples = function(elements) {
		var result = [];
		for(var i = 0; i < elements.length; ++i) {
			var element = elements[i];
			if(element instanceof sparql.ElementTriplesBlock) {
				result.push.apply(result, element.triples);
			}
		}
		
		return result;
	};
	
	
	/**
	 * Combines the elements of two concepts, yielding a new concept.
	 * The new concept used the variable of the second argument.
	 * 
	 */
	ns.ConceptUtils = {
		createCombinedConcept: function(baseConcept, tmpConcept) {
			// TODO The variables of baseConcept and tmpConcept must match!!!
			// Right now we just assume that.
			
			
			// Check if the concept of the facetFacadeNode is empty
			var tmpElements = tmpConcept.getElements();
			var baseElement = baseConcept.getElement();
			
			// Small workaround (hack) with constraints on empty paths:
			// In this case, the tmpConcept only provides filters but
			// no triples, so we have to include the base concept
			var hasTriplesTmp = tmpConcept.hasTriples();
			
			var e;
			if(tmpElements.length > 0) {
	
				if(hasTriplesTmp && baseConcept.isSubjectConcept()) {
					e = tmpConcept.getElement();
				} else {
					var baseElements = baseConcept.getElements();
	
					var newElements = [];
					newElements.push.apply(newElements, baseElements);
					newElements.push.apply(newElements, tmpElements);
					
					e = new sparql.ElementGroup(newElements);
				}
			} else {
				e = baseElement;
			}
			
			// FIXME: ConceptInt class is not defined
			var concept = new ns.ConceptInt(e, tmpConcept.getVariable());
	
			return concept;
		},
		
		createSubjectConcept: function(s, p, o) {
			
			//var s = sparql.Node.v("s");
			s = s || rdf.NodeFactory.createVar('s');
			p = p || rdf.NodeFactory.createVar('_p_');
			o = o || rdf.NodeFactory.createVar('_o_');
			
			var conceptElement = new sparql.ElementTriplesBlock([new rdf.Triple(s, p, o)]);

			//pathManager = new facets.PathManager(s.value);
			
			var result = new ns.Concept(conceptElement, s);

			return result;
		},
		
		
		/**
		 * Creates a query based on the concept
		 * TODO: Maybe this should be part of a static util class?
		 */
		createQueryList: function(concept, limit, offset) {
			var result = new sparql.Query();
			result.setDistinct(true);
			
			result.setLimit(limit);
			result.setOffset(offset);
			
			result.getProject().add(concept.getVar());
			var resultElements = result.getElements();
			var conceptElements = concept.getElements();

			resultElements.push.apply(resultElements, conceptElements);
			
			return result;
		},

		createNewVar: function(concept, baseVarName) {
            baseVarName = baseVarName || 'c';

            var varsMentioned = concept.getVarsMentioned();

            var varGen = sparql.VarUtils.createVarGen(baseVarName, varsMentioned);
            var result = varGen.next();
		    
            return result;
		},
		
		createQueryCount: function(concept, outputVar, scanLimit) {
		    var result = ns.QueryUtils.createQueryCount(concept.getElements(), scanLimit, concept.getVar(), outputVar, null, true);
		    
		    return result;
		},
		
        createQueryCountNotAsConciseAsPossible: function(concept, outputVar) {
            /*
            var subQuery = new sparql.Query();
            
            subQuery.getProject().add(concept.getVar());
            subQuery.setDistinct(true);

            var subQueryElements = subQuery.getElements();
            var conceptElements = concept.getElements();
            subQueryElements.push.apply(subQueryElements, conceptElements)
            */
            
            var subQuery = ns.ConceptUtils.createQueryList(concept);
            
            var result = new sparql.Query();
            result.getProject().add(outputVar, new sparql.E_Count());

            result.getElements().push(subQuery);
 
            return result;          
        },

		createQueryCountDoesNotWorkWithVirtuoso: function(concept, outputVar) {
			var result = new sparql.Query();
			
			result.getProject().add(outputVar, new sparql.E_Count(new sparql.ExprVar(concept.getVar()), true));

			var resultElements = result.getElements();
			var conceptElements = concept.getElements();
			resultElements.push.apply(resultElements, conceptElements);

			return result;			
		}
	};

	

	/**
	 * A class for holding information which variable
	 * of an element corresponds to the property and
	 * which to the 
	 * 
	 * ({?s ?p ?o}, ?p, ?o)
	 * 
	 * 
	 */
	ns.FacetConcept = Class.create({
		initialize: function(elements, facetVar, facetValueVar) {
			this.elements = elements;
			this.facetVar = facetVar;
			this.facetValueVar = facetValueVar;
		},
		
		getElements: function() {
			return this.elements;
		},
		
		getFacetVar: function() {
			return this.facetVar;
		},
		
		getFacetValueVar: function() {
			return this.facetValueVar;
		},
		
		toString: function() {
			var result = "FacetConcept: ({" + this.elements.join(", ") + "}, " + this.facetVar + ", " + this.facetValueVar + ")";
			return result;
		}
	});


	/**
	 * A concept is pair comprised of a sparql graph
	 * pattern (referred to as element) and a variable.
	 * 
	 */
	ns.Concept = Class.create({
		
		classLabel: 'jassa.sparql.Concept',
		
		initialize: function(element, variable) {
			this.element = element;
			this.variable = variable;
		},
		
		toJson: function() {
			var result = {
					element: JSON.parse(JSON.stringify(this.element)),
					variable: this.variable
			};
			
			return result;
		},
		
		getElement: function() {
			return this.element;
		},
		
		getVarsMentioned: function() {
		    // TODO The variable is assumed to be part of the element already
		    var result = this.getElement().getVarsMentioned();
		    return result;
		},
		
		hasTriples: function() {
			var elements = this.getElements();
			var triples = ns.getElementsDirectTriples(elements);
			var result = triples.length > 0;
			
			return result;
		},
		
		/**
		 * Convenience method to get the elements as an array.
		 * Resolves sparql.ElementGroup
		 * 
		 */
		getElements: function() {
			var result;
			
			if(this.element instanceof sparql.ElementGroup) {
				result = this.element.elements;
			} else {
				result = [ this.element ];
			}
			
			return result;
		},

		getVar: function() {
			return this.variable;				
		},
		
		getVariable: function() {
			
			if(!this.warningShown) {				
				//console.log('[WARN] Deprecated. Use .getVar() instead');
				this.warningShown = true;
			}
			
			return this.getVar();
		},
		
		toString: function() {
			return "" + this.element + "; " +  this.variable;
		},
		
		// Whether this concept is isomorph to (?s ?p ?o, ?s)
		isSubjectConcept: function() {
			var result = false;
			
			var v = this.variable;
			var e = this.element;
			
			if(e instanceof sparql.ElementTriplesBlock) {
				var ts = e.triples;
				
				if(ts.length === 1) {
					var t = ts[0];
					
					var s = t.getSubject();
					var p = t.getProperty();
					var o = t.getObject();
					
					result = v.equals(s) && p.isVariable() && o.isVariable();
				}
			}

			
			return result;
		},

		combineWith: function(that) {
			var result = ns.createCombinedConcept(this, that);
			return result;
		},
		
		createOptimizedConcept: function() {
			var element = this.getElement();
			var newElement = element.flatten();

      // FIXME: ConceptInt class is not defined
			var result = new ns.ConceptInt(newElement, this.variable);

			return result;
		},
		

		
		/**
		 * Remove unnecessary triple patterns from the element:
		 * Example:
		 * ?s ?p ?o
		 * ?s a :Person
		 *  
		 *  We can remove ?s ?p ?o, as it does not constraint the concepts extension.
		 */
		getOptimizedElement: function() {

			/* This would become a rather complex function, the method isSubjectConcept is sufficient for our use case */
			
			
		}
	});


	//ns.Concept.classLabel = 'Concept';


	/**
	 * Array version constructor
	 * 
	 */
	ns.Concept.createFromElements = function(elements, variable) {
		var element;
		if(elements.length == 1) {
			element = elements[0];
		} else {
			element = new sparql.ElementGroup(elements);
		}
		
		var result = new ns.Concept(element, variable);
		
		return result;
	};

	
})();

