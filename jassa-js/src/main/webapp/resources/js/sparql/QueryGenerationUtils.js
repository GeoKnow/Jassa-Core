/**
 * This file contains functions for constructing queries for
 * fetching information about sets of resources
 * indirectly specified by query elements.
 *
 * The purpose is to enable facetted browsing.
 */
(function($) {

	var sparql = Namespace("org.aksw.ssb.sparql.syntax");
	var facets = Namespace("org.aksw.ssb.facets");

	var rdf = Namespace("org.aksw.ssb.vocabs.rdf");
	var rdfs = Namespace("org.aksw.ssb.vocabs.rdfs");
	var owl = Namespace("org.aksw.ssb.vocabs.owl");
	var geo = Namespace("org.aksw.ssb.vocabs.wgs84");
	
	var ns = Namespace("org.aksw.ssb.facets.QueryUtils");

	
	ns.requireIntensionalConcept = function(concept) {
		if(!concept.isIntensional()) {
			throw "Intensional concept required";
		}
	};
	
	
	ns.createSearchElements = function(searchText, vars) {

		
		var langTags = ["en", ""];
		
		var finalOrs = [];

		var evLabels = [];
		var optionals = [];
		for(var i = 0; i < vars.length; ++i) {
			var v = vars[i];

			/*
			 * Filter URIs
			 */
			
			var exprUri = createFilterExpr(new sparql.ExprVar(v), searchText);
			finalOrs.push(exprUri);
			
			/*
			 * Filter labels
			 */
		
			var vLabel = sparql.Node.v(v.value + "_lbl");
			var evLabel = new sparql.ExprVar(vLabel);

			evLabels.push(evLabel);
			
			var triple = new sparql.Triple(v, rdfs.label, vLabel);				
			var exprLabel = createFilterExpr(evLabel, searchText);

			var exprLang;
			
			if(langTags) {
				var exprLangs = [];
				for(var j = 0; j < langTags.length; ++j) {
					var langTag = langTags[j];
					
					var e = new sparql.E_LangMatches(new sparql.E_Lang(evLabel), sparql.Node.plainLit(langTag));
					
					exprLangs.push(e);
				}
			
				exprLang = sparql.orify(exprLangs);
			} else {
				exprLang = null;
			}

			
			var exprFinal;
			if(exprLang) {
				exprFinal = new sparql.E_LogicalAnd(exprLabel, exprLang);
			} else {
				exprFinal = exprLabel;
			}

			
			var element = new sparql.ElementGroup([
                new sparql.ElementTriplesBlock([triple]),
                new sparql.ElementFilter([exprFinal])
            ]);
			
			var optional = new sparql.ElementOptional(element); 				
			optionals.push(optional);
		}
		
		// One of the labels must be bound
		for(var i = 0; i < evLabels.length; ++i) {
			var evLabel = evLabels[i];
			var boundLabel = new sparql.E_Bound(evLabel);
			
			finalOrs.push(boundLabel);
		}
		
		var result = [];
		result.push.apply(result, optionals);

		if(finalOrs.length > 0) {
			//console.log("Final ors: ", finalOrs);
			var finalOr = sparql.orify(finalOrs);
			var finalFilter = new sparql.ElementFilter([finalOr]);
			
			result.push(finalFilter);
		}
		
		return result;
	};
	
	
	
	ns.createSubjectConcept = function(subjectVar) {
		
		//var s = sparql.Node.v("s");
		var s = subjectVar;
		var p = sparql.Node.v("_p_");
		var o = sparql.Node.v("_o_");
		
		var conceptElement = new sparql.ElementTriplesBlock([new sparql.Triple(s, p, o)]);

		//pathManager = new facets.PathManager(s.value);
		
		result = new facets.ConceptInt(conceptElement, s);

		return result;
	};

	
	/**
	 * Creates a {?s ?p ?o} concept.
	 * The subject must be specified. 
	 * 
	 */
	// @Deprecated
	function createDriverFallback(subjectVar) {
		return ns.createSubjectConcept(subjectVar);
	};

	
	/**
	 * Creates a query for any resource, that is:
	 * Select Distinct ?s { { ?s ?x ?y } Union { ?x ?s ?y } Union { ?x ?y ?s } }
	 * 
	 */
	ns.createQueryAnyResource = function(outputVar) {
		var concept = new facets.ConceptInt(ns.createElementAnyResource(outputVar), outputVar);
		var result = ns.createQuerySelect(concept, {distinct: true});
		return result;
	};
	
	/**
	 * Creates an element for any resource, that is:
	 * { ?s ?x ?y } Union { ?x ?s ?y } Union { ?x ?y ?s }
	 */
	ns.createElementAnyResource = function(outputVar) {
		var s = outputVar;
		var x = sparql.Node.v("__x");
		var y = sparql.Node.v("__y");
		
		var result = new sparql.ElementUnion([
		    new sparql.ElementTriplesBlock([new sparql.Triple(s, x, y)]),
		    new sparql.ElementTriplesBlock([new sparql.Triple(x, s, y)]),
		    new sparql.ElementTriplesBlock([new sparql.Triple(x, y, s)]),
		]);
		
		return result;
	};

	/**
	 * Creates a query that retrives all _explicit_ OWL classes in the store.
	 * Does not consider implicit classes through rdf:type. 
	 * 
	 */
	ns.createQueryGetClasses = function(outputVar) {
		var concept = new facets.ConceptInt(ns.createElementGetClasses(outputVar), outputVar);
		var result = ns.createQuerySelect(concept, {distinct: true});

		return result;
	};
	

	/**
	 * Creates an element identifying all _explicit_ OWL classes in the store.
	 * Does not consider implicit classes through rdf:type. 
	 * 
	 */
	ns.createElementGetClasses = function(outputVar) {
		var s = outputVar;
		var x = sparql.Node.v("__x");
		
		var result = new sparql.ElementUnion([
		    new sparql.ElementTriplesBlock([new sparql.Triple(s, rdf.type, owl.Class)]),
		    new sparql.ElementTriplesBlock([new sparql.Triple(x, rdfs.subClassOf, s)]),
		    new sparql.ElementTriplesBlock([new sparql.Triple(s, rdfs.subClassOf, x)]),
		]);
		
		return result;
	};
	
	
	/**
	 * Returns a query that retrives all resources that act as rdf:types of others. 
	 * Select Distinct ?t { ?s a ?t } 
	 * 
	 */
	ns.createQueryGetTypes = function(outputVar) {
		var result = new sparql.Query();
		
		var s = outputVar;
		var t = sparql.Node.v("t");
		
		var element = new sparql.ElementTriplesBlock([new sparql.Triple(s, rdf.type, t)]);
		
		result.projectVars.add(t);
		result.distinct = true;
		result.elements.push(element);
		
		return result;		
	};
	
	/**
	 * Creates a query for all named graphs in a store.
	 * 
	 * Select Distinct ?g { Graph ?g { ?s ?p ?o } }
	 * 
	 */
	ns.createQueryGetNamedGraphs = function(outputVar) {
		var concept = new facets.ConceptInt(ns.createElementGetNamedGraphs(outputVar), outputVar);
		var result = ns.createQuerySelect(concept, {distinct: true});

		return result;
	};

	/**
	 * Creates a query for all named graphs in a store.
	 * Fallback for a bug in Virtuoso 6.1.5, which has a broken cache for this query.
	 * 
	 */
	ns.createQueryGetNamedGraphsFallback = function(outputVar) {
		var concept = new facets.ConceptInt(ns.createElementGetNamedGraphsFallback(outputVar), outputVar);
		var result = ns.createQuerySelect(concept, {distinct: true});

		return result;
	};

	ns.createElementGetNamedGraphsFallback = function(outputVar) {
		var subQuery = ns.createQueryGetNamedGraphs(outputVar);
		subQuery.distinct = false;
		var result = new sparql.ElementSubQuery(subQuery);

		return result;
	};

	ns.createElementGetNamedGraphs = function(outputVar) {
		var g = outputVar;
		var s = sparql.Node.v("s");
		var p = sparql.Node.v("p");
		var o = sparql.Node.v("o");
		
		var result = new sparql.ElementNamedGraph(new sparql.ElementTriplesBlock([new sparql.Triple(s, p, o)]), g);

		return result;
	};
	
	
	ns.createQuerySelectElement = function(element, vars, options) {
		var result = new sparql.Query();
		
		result.projectVars.addAll(vars);
		result.elements.push(element);

		ns.applyQueryOptions(result, options);
		
		return result;
	};

	
	/**
	 * Creates a Select-Query from an intensional concept.
	 * 
	 * Select ?conceptVar { conceptElement }
	 * 
	 * options:
	 *     distinct
	 *     limit
	 *     offset
	 * 
	 */
	ns.createQuerySelect = function(concept, options) {

		ns.requireIntensionalConcept(concept);
		
		var result = new sparql.Query();
		
		result.projectVars.add(concept.getVariable());
		result.elements.push(concept.getElement());

		ns.applyQueryOptions(result, options);
		
		return result;
	};
	
	
	ns.applyQueryOptions = function(query, options) {
		if(!options) {
			return;
		}
		
		query.distinct = options.distinct ? true : false;
		
		query.limit  = options.limit ? options.limit : null;
		query.offset = options.offset ? options.offset : null;			
	};

	/**
	 * Creates a query that fetches plain facets (i.e. no counts)
	 * Select Distinct ?p {
	 *     [concept] (optional)
	 *     ?conceptVar ?p ?o .
	 * }
	 */
	ns.createFacetQueryPlain = function(concept, conceptVar) {
		var result = new sparql.Query();
		
		if(concept) {
			result.elements.push(concept);
		}
		
 
		var p = sparql.Node.v("__p");
		var triple = new sparql.Triple(concept, p, sparql.Node.v("__o"));		
		result.elements.push(new sparql.ElementTriplesBlock(triple));
		
		result.projectVars.add(p);
		///result.projection[p.value] = null;
		
		return result;
	};


	ns.createDescribeQueryNodes = function(nodes) {		
		var s = sparql.Node.v("__s");
		var element = new sparql.ElementFilter([new sparql.E_In(s, nodes)]);
		var result = ns.createDescribeQuery(element, s);
		return result;
	};
	
	
	
	ns.createDescribeQuery = function(concept, conceptVar) {
		var result = new sparql.Query();
		result.type = sparql.QueryType.Construct;
		
		result.elements.push(concept);
		
		var p = sparql.Node.v("__p");
		var o = sparql.Node.v("__o");
		
		var triple = new sparql.Triple(conceptVar, p, o);

		result.constructTemplate = new sparql.Template(new sparql.BasicPattern([triple]));
		
		result.elements.push(new sparql.ElementTriplesBlock([triple]));
		
		return result;
	};
	
	
	
	ns.createQueryDescribe = function(node) {
		var result = new sparql.Query();

		var element = ns.createElementDescribe(node);
		result.elements.push(element);

		var property = sparql.Node.v("property");
		var hasValue = sparql.Node.v("hasValue");
		//var isValueOf = sparql.Node.v("isValueOf");
		
		result.projectVars.addAll([property, hasValue]); //, isValueOf]);
		
		var evProperty = new sparql.ExprVar(property);
		var evHasValue = new sparql.ExprVar(hasValue);
		//var evIsValueOf = new sparql.ExprVar(isValueOf);

		result.orderBy.push(new sparql.E_LogicalNot(new sparql.E_Bound(evHasValue)));
		result.orderBy.push(new sparql.SortCondition(evProperty));
		result.orderBy.push(new sparql.SortCondition(evHasValue));
		//result.orderBy.push(new sparql.SortCondition(evIsValueOf));
		
		return result;
	}

	/**
     * SELECT DISTINCT ?property ?hasValue ?isValueOf
     * WHERE {
     * { <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ?property ?hasValue }
     *  UNION
     *  { ?isValueOf ?property <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> }
     *}
     *ORDER BY (!BOUND(?hasValue)) ?property ?hasValue ?isValueOf	
     */
	ns.createElementDescribe = function(node) {
		var property = sparql.Node.v("property");
		var hasValue = sparql.Node.v("hasValue");
		var isValueOf = sparql.Node.v("isValueOf");
		
		var elements = [];
		
		var triple = new sparql.Triple(node, property, hasValue);
		elements.push(new sparql.ElementTriplesBlock([triple]));
		
		if(false) {
			var tripleInv = new sparql.Triple(isValueOf, property, node);
			elements.push(new sparql.ElementTriplesBlock([tripleInv]));
		}

		var result;
		if(elements.length > 1) {
			result = new sparql.ElementTriplesBlock(elements);
		} else {
			result = elements[0];
		}
		
//		var result = new sparql.ElementUnion([
//            new sparql.ElementTriplesBlock([triple]),
//            new sparql.ElementTriplesBlock([tripleInv])
//		]);
		
		return result;
	}

	
	/**
	 * Returns the facets for which pivoting is possible - i.e. pivoting does not lead to dead ends.
	 * 
	 * Forward:
	 * Select Distinct ?p {
	 *   ?o ?x ?y
	 *   
	 *   {?s ?p ?o
	 *   concept(?s)}
	 * }
	 * 
	 * Backward:
	 *     Select Distinct ?p {
	 *       ?y ?x ?o
	 *       
	 *       {?s ?p ?o
	 *       concept(?s)}
	 *     }

	 */
	ns.createQueryGetPivotFacets = function(concept, outputVar, isInverse) {
		var result = new sparql.Query();
				
		result.elements.push(concept.getElement());
		
		//var s = sparql.Node.v(concept.getVariable());
		var s = concept.getVariable();
		var p = outputVar; //sparql.Node.v("__p");
		var o = sparql.Node.v("__o");
		var x = sparql.Node.v("__x");
		var y = sparql.Node.v("__y");

		var triples = isInverse
			? [ new sparql.Triple(o, p, s), new sparql.Triple(y, x, o) ]
			: [ new sparql.Triple(s, p, o), new sparql.Triple(o, x, y) ];
		
		var triplesBlock = new sparql.ElementTriplesBlock(triples);
		
		result.elements.push(triplesBlock);
		
		result.distinct = true;
		result.projectVars.add(outputVar);

		console.log("PivotCheckQuery", result);
		return result;
	};

	


	/**
	 * Counts the number of distinct objects per property.
	 * 
	 */
	/*
	ns.createQueryCountDistinctVar = function(concept, conceptVar, distinctVar, sampleSize) {
		// The maximum number of instances to scan for collecting properties		
		
		var q = new sparql.Query();
		
		q.distinct = true;
		
		var p = sparql.Node.v("__p");
		//var o = sparql.Node.v("__o");
		var c = sparql.Node.v("__c");
		
		q.projectVars.add(p);
		q.projectVars.add(c, new sparql.E_Count(new sparql.ExprVar(distinctVar), true));
		///q.projection[p.value] = null;
		///q.projection[c.value] = new sparql.E_Count(new sparql.ExprVar(p));

		//q.projection[c.value] = new sparql.E_Count(new sparql.ExprVar(conceptVar));

		var tmp = q;
		if(true) { // limit instances to check for properties
		    var subQuery = new sparql.Query();
		    
		    if(false) {
		    	subQuery.isResultStar = true;
		    } else {
		    	//console.error(conceptVar);
		    	subQuery.projectVars.add(conceptVar);
		    	subQuery.projectVars.add(o);
		    	///subQuery.projection[conceptVar.value] = null;
		    	///subQuery.projection[p.value] = null;
		    	subQuery.distinct = true;
		    }
		    
		    
		    subQuery.limit = sampleSize;
		    q.elements.push(new sparql.ElementSubQuery(subQuery));
		    
		    tmp = subQuery;
		}
		
		
		//console.log("Driver", concept);
		
		tmp.elements.push(concept);
		tmp.elements.push(new sparql.ElementTriplesBlock([new sparql.Triple(conceptVar, p, o)]));
		
		
		// TODO We could reduce the number of requests if we fetched labels here
		// The problem (as usual) is how to deal with alternative lang tags:
		// primary lang (de), secondary lang (en), fallback (no lang tag)
		// ?x label ?l1 , ?l2 , ?l3 . Filter(?(  
		/*
		var result;
		var lang
		if(true) { // Fetch the labels of the properties
			result = new sparql.Query();
			result.projection[]
		}
		* /
		
		// TODO Order by ?o ?p
		q.order.push(new sparql.Order(new sparql.ExprVar(c), sparql.OrderDir.Desc));
		
		//console.log("Created query: " + q);
		return q;
	};
	*/

	ns.createElementFacetCount = function(concept, isInverse, facetVar, valueVar, sampleSize) {
		var result = new sparql.ElementGroup();
		
		// If the concept is isomorph to (?s ?p ?o , ?s), skip it because we are going to add the same triple
		if(!concept.isSubjectConcept()) {
			var de = concept.getElement();
			result.elements.push(de);
		}
		
		var s = concept.getVariable();
		var p = facetVar;
		var o = valueVar;
	
		var triples = isInverse
			? [ new sparql.Triple(o, p, s) ]
			: [ new sparql.Triple(s, p, o) ];
		
		var triplesBlock = new sparql.ElementTriplesBlock(triples);
		
		result.elements.push(triplesBlock);
		
		return result;
	};
	
	/**
	 * Select ?facetVar (Count(Distinct(?__o)) As ?countFacetVar) { }
	 * 
	 */
	ns.createQueryFacetCount = function(concept, facetVar, countFacetVar, isInverse, sampleSize) {

		//var facetVar = sparql.Node.v("__p");
		var valueVar = sparql.Node.v("__o");
		var element = ns.createElementFacetCount(concept, isInverse, facetVar, valueVar, sampleSize);
		
		var result = ns.createQueryCount(element, sampleSize, valueVar, countFacetVar, [facetVar], true);

		return result;
	};
	
	/**
	 * Counts the number of unique subjects per property.
	 * NOTE: This is not what you want as facet counts
	 * 
	 * The generated query has the form:
	 * Select Distinct ?p (Count(?p) As ?c) {
	 *   { Select Distinct ?s ?p { concept . ?s ?p ?o . } }
	 * }
	 * 
	 * NOTE Variables are __s, __p, __o. Beware of name clashes.
	 * 
	 */
	ns.createFacetQueryCount2 = function(concept, conceptVar, sampleSize) {
		// The maximum number of instances to scan for collecting properties		
		
		var q = new sparql.Query();
		
		q.distinct = true;
		
		var p = sparql.Node.v("__p");
		var o = sparql.Node.v("__o");
		var c = sparql.Node.v("__c");
		
		q.projectVars.add(p);
		q.projectVars.add(c, new sparql.E_Count(new sparql.ExprVar(p)));
		///q.projection[p.value] = null;
		///q.projection[c.value] = new sparql.E_Count(new sparql.ExprVar(p));

		//q.projection[c.value] = new sparql.E_Count(new sparql.ExprVar(conceptVar));
		
		var tmp = q;
		if(true) { // limit instances to check for properties
		    var subQuery = new sparql.Query();
		    
		    if(false) {
		    	subQuery.isResultStar = true;
		    } else {
		    	//console.error(conceptVar);
		    	subQuery.projectVars.add(conceptVar);
		    	subQuery.projectVars.add(p);
		    	///subQuery.projection[conceptVar.value] = null;
		    	///subQuery.projection[p.value] = null;
		    	subQuery.distinct = true;
		    }
		    
		    
		    subQuery.limit = sampleSize;
		    q.elements.push(new sparql.ElementSubQuery(subQuery));
		    
		    tmp = subQuery;
		}
		
		
		//console.log("Driver", concept);
		
		tmp.elements.push(concept);
		tmp.elements.push(new sparql.ElementTriplesBlock([new sparql.Triple(conceptVar, p, o)]));
		
		
		// TODO We could reduce the number of requests if we fetched labels here
		// The problem (as usual) is how to deal with alternative lang tags:
		// primary lang (de), secondary lang (en), fallback (no lang tag)
		// ?x label ?l1 , ?l2 , ?l3 . Filter(?(  
		/*
		var result;
		var lang
		if(true) { // Fetch the labels of the properties
			result = new sparql.Query();
			result.projection[]
		}
		*/
		
		// TODO Order by ?o ?p
		q.order.push(new sparql.Order(new sparql.ExprVar(c), sparql.OrderDir.Desc));
		
		//console.log("Created query: " + q);
		return q;
	};

	
	/**
	 * Counts the number of focus-resources per facet value
	 * 
	 */
	ns.createQueryFacetValuesCountedFiltered = function(baseElement, breadcrumb, sampleSize, searchString, countVar) {
		var element = ns.createElementFacetValues(baseElement, breadcrumb, searchString);
		
		var sourceVar = sparql.Node.v(breadcrumb.sourceNode.variable);
		var facetVar = sparql.Node.v(breadcrumb.targetNode.variable);
		
		//var result = ns.createQueryFacetValuesCounted(element, breadcrumb, sampleSize);
		var result = ns.createQueryCount(element, sampleSize, sourceVar, countVar, [facetVar]);

		//alert(result);
		return result;
	};

	/*
	 * Creates a query for counting the distinct number of facet values.
	 * e.g. there is 10 distinct values for the facet 'ValuesBetween 0 and 9 (inclusive)'.
	 * 
	 * 
	 */
	ns.createQueryCountFacetValues = function(baseElement, breadcrumb, searchString, sampleSize, countVar) {
		var element = ns.createElementFacetValues(baseElement, breadcrumb, searchString);
		var facetVar = sparql.Node.v(breadcrumb.targetNode.variable);
		var result = ns.createQueryCount(element, sampleSize, facetVar, countVar);
		return result;
	};
	

	
	ns.createElementLabelRegex = function(conceptVar, searchString, labelVar, property) {
		property = property ? property : rdfs.label;
		labelVar = labelVar ? labelVar : sparql.Node.v("__l");
		
		var filterExpr = new sparql.E_LogicalOr(
				new sparql.E_Regex(new sparql.E_Str(new sparql.ExprVar(conceptVar)), searchString, "i"),
				new sparql.E_Regex(new sparql.ExprVar(labelVar), searchString, "i"));
		
		var optionalElement = new sparql.ElementTriplesBlock([new sparql.Triple(conceptVar, property, labelVar)]);
		var optional = new sparql.ElementOptional(optionalElement);		

		element = new sparql.ElementGroup();		
		element.elements.push(optional);
		element.elements.push(new sparql.ElementFilter([filterExpr]));

		return element;
	};
	

	/**
	 * Filters an element
	 * 
	 * element
	 *   Optional {
	 *     ?facetVar label ?labelVar .
	 *   }
	 *   Filter(regex(str(?facetVar), ...) || Filter(regex(?labelVar, ...)))
	 *     
	 *  
	 */
	ns.createElementFiltered = function(breadcrumb, searchString, property) {
		if(!searchString) {
			return null;
		}	
		
		// Get or create the variable for the label
		var facetVar = sparql.Node.v(breadcrumb.targetNode.variable);
		var labelVar = sparql.Node.v(breadcrumb.targetNode.getOrCreate(rdfs.label.value).variable);

		var result = ns.createElementLabelRegex(facetVar, searchString, labelVar, property);
		return result;
		
		/*
		var filterExpr = new sparql.E_LogicalOr(
				new sparql.E_Regex(new sparql.E_Str(new sparql.ExprVar(facetVar)), searchString, "i"),
				new sparql.E_Regex(new sparql.ExprVar(labelVar), searchString, "i"));
		
		var optionalElement = new sparql.ElementTriplesBlock([new sparql.Triple(facetVar, rdfs.label, labelVar)]);
		var optional = new sparql.ElementOptional(optionalElement);		

		element = new sparql.ElementGroup();		
		element.elements.push(optional);
		element.elements.push(new sparql.ElementFilter(filterExpr));
		
		return element;
		*/
	};
	

	ns.createElementFacetValues = function(baseElement, breadcrumb, searchString) {
		var result = new sparql.ElementGroup();
		
		if(baseElement) {
			result.elements.push(baseElement);
		}
		
		var breadcrumbElement = new sparql.ElementTriplesBlock(breadcrumb.getTriples());
		result.elements.push(breadcrumbElement);
		
		var searchElement = ns.createElementFiltered(breadcrumb, searchString);

		if(searchElement) {
			result.elements.push(searchElement);
		}
		
		return result;
	};
	
	
	/**
	 * Create a query for fetching the values and their counts of a facet
	 * 
	 * Example:
	 * If the facet corresponds to { ?s rdfs:label ?o }, then the query is
	 * 
	 * Select Distinct ?o Count(?s) { { Select Distinct ?s { ?s concept ... constraints . } Limit 10001 } . ?s rdfs:label ?o .
	 * 
	 * 
	 * @param config
	 * @param facet
	 * @param sampleSize Puts a limit on the number of resources to consider
	 */
	ns.createQueryFacetValuesCounted = function(baseElement, breadcrumb, sampleSize) {
		
		console.log("BaseElement", "" + baseElement);
		console.log("Breadcrumb", "" + breadcrumb, breadcrumb);
		
		
		// The maximum number of instances to scan for collecting properties
		//var config = facet.getConfig();

		var element = new sparql.ElementTriplesBlock(breadcrumb.getTriples());
		
		//console.warn("baseElement/breadcrumb", baseElement, breadcrumb);
		
		//var element = baseElement; //breadcrumb.getTriples();
		//var inputVar = sparql.Node.v(breadcrumb.sourceNode.variable);
		var inputVar = sparql.Node.v(breadcrumb.sourceNode.variable);
		var outputVars = [sparql.Node.v(breadcrumb.targetNode.variable)];
		
		//var element = facet.getElement();
		//var outputVars = _.difference(facet.getElement().getVarsMentioned(), [inputVar]);
		//console.log("Outputvars=", facet.getElement().getVarsMentioned(), inputVar);

		var result = new sparql.Query();
		for(var i in outputVars) {
			var outputVar = outputVars[i];
			
			//var varNode = sparql.Node.v(outputVar);
			result.projectVars.add(outputVar);
			//result.projection[outputVar] = null; //varNode;
		}
		
		
		result.distinct = true;
		
		//var p = sparql.Node.v("__p");
		//var o = sparql.Node.v("__o");
		var c = sparql.Node.v("__c");
		
		//result.projection[p] = null;
		///result.projection[c.value] = new sparql.E_Count();
		result.projectVars.add(c, new sparql.E_Count());


		var subQuery = result;
		if(sampleSize) { // limit instances to check for properties
		    subQuery = new sparql.Query();
		    subQuery.isResultStar = true;
		    subQuery.limit = sampleSize;
		    result.elements.push(new sparql.ElementSubQuery(subQuery));
		    
		    tmp = subQuery;
		}

		//subQuery.elements.push(config.concept);
		subQuery.elements.push(baseElement);
		subQuery.elements.push(element);

		result.elements.push(element);
		
		
		
		// TODO We could reduce the number of requests if we fetched labels here
		// The problem (as usual) is how to deal with alternative lang tags:
		// primary lang (de), secondary lang (en), fallback (no lang tag)
		// ?x label ?l1 , ?l2 , ?l3 . Filter(?(  
		/*
		var result;
		var lang
		if(true) { // Fetch the labels of the properties
			result = new sparql.Query();
			result.projection[]
		}
		*/
		
		// TODO Order by ?o ?p
		result.order.push(new sparql.Order(new sparql.ExprVar(c), sparql.OrderDir.Desc));
		
		for(var i in outputVars) {
			var outputVar = outputVars[i];			
			result.order.push(new sparql.Order(new sparql.ExprVar(outputVar), sparql.OrderDir.Asc));
		}

		
		
		
		console.debug("Created query: " + result);
		return {query: result, outputVars: outputVars };
		
	};
	


	
	/**
	 * Wraps an element for counting (possibly using group by)
	 * 
	 * Select [groupVars] (Count(variable) As outputVar) {
	 *     { Select Distinct(variable) {
	 *         element(variable)
	 *     } Limit limit }
	 * }
	 * 
	 * TODO Explicitely group by groupVars; not needed for virtuoso.
	 * 
	 * If one of the groupVars equals the variable, it is omitted
	 * 
	 */
	ns.createQueryCountOldNotSureWhyIDidThisSubQueryThing = function(element, limit, variable, outputVar, groupVars, options) {
		
		
		var subQuery = new sparql.Query();
		
		subQuery.elements.push(element); //element.copySubstitute(function(x) { return x; }));

		if(variable) {
			subQuery.projectVars.add(variable);
		} else {
			subQuery.isResultStar = true;
		}

		///subQuery.projection[variable.value] = null;
		subQuery.distinct = true;
		
		if(limit) {
			subQuery.limit = limit;
		}
		
		var result = new sparql.Query();
		
		if(groupVars) {
			for(var i = 0; i < groupVars.length; ++i) {
				
				var groupVar = groupVars[i];
				
				if(groupVar.value !== variable.value) {
					subQuery.projectVars.add(groupVar);
				}
				
				// FIXME Only works with virtuoso if we do not additionally
				// add variables to the group by clause
				result.projectVars.add(groupVar);
			}
		}
		
		result.projectVars.add(outputVar, new sparql.E_Count()); //new sparql.ExprVar(variable)));
		///result.projection["c"] = new sparql.E_Count(new sparql.ExprVar(variable));
		result.elements.push(new sparql.ElementSubQuery(subQuery));
		
		//console.error(limit);
		//console.error(result.toString());
		
		ns.applyQueryOptions(result, options);

		
		return result;
	};
	
	

	/**
	 * Creates a query with Count(Distinct ?variable)) As outputVar for an element.
	 * 
	 */
	ns.createQueryCount = function(element, limit, variable, outputVar, groupVars, useDistinct, options) {

		
		var exprVar = variable ? new sparql.ExprVar(variable) : null;
		
		var result = new sparql.Query();
		if(limit) {
			var subQuery = new sparql.Query();
			
			subQuery.elements.push(element); //element.copySubstitute(function(x) { return x; }));

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
			
			result.elements.push(new sparql.ElementSubQuery(subQuery));			
		} else {
			result.elements.push(element);
		}
		
		//result.groupBy.push(outputVar);
		if(groupVars) {
			for(var i = 0; i < groupVars.length; ++i) {
				var groupVar = groupVars[i];				
				//if(groupVar.value !== variable.value) {
					result.projectVars.add(groupVar);
					result.groupBy.push(new sparql.ExprVar(groupVar));
				//}
			}
		}
		
		result.projectVars.add(outputVar, new sparql.E_Count(exprVar, useDistinct));
		ns.applyQueryOptions(result, options);
		
//debugger;
		//console.log("Created count query:" + result + " for element " + element);
		return result;
	};

	/*
	ns.createPlainQueryGenerator = function(queryGenerator, uris) {

		var concept = queryGenerator.concept;
		var inferredDriver = queryGenerator.getInferredDriver();

		//var geoQueryFactory = this.queryGenerator.createQueryFactory();


		//console.log("queryFactory", queryFactory);

		var subQuery = new sparql.Query();
		var triplesBlock = new sparql.ElementTriplesBlock();
		triplesBlock.addTriples(queryGenerator.geoConstraintFactory.getTriples());
		subQuery.elements.push(triplesBlock);
		
		var geomSrcVar = sparql.Node.v(queryGenerator.geoConstraintFactory.breadcrumb.sourceNode.variable);
		var geomVarStr = queryGenerator.geoConstraintFactory.breadcrumb.targetNode.variable; //geoQueryFactory.geoConstraintFactory.breadcrumb.targetNode.variable;
		var geomVarExpr = new sparql.ExprVar(sparql.Node.v(geomVarStr));
		//console.log("geomVar", geomVar);
		var filterExpr = (uris.length === 0) ? sparql.NodeValue.False : new sparql.E_In(geomVarExpr, uris);
		var filterElement = new sparql.ElementFilter(filterExpr);

		subQuery.elements.push(filterElement);
		//subQuery.projectVars.add(inferredDriver.variable);
		//subQuery.projectVars.add(concept.getVariable());
		subQuery.projectVars.add(geomSrcVar);
		///subQuery.projection[concept.getVariable().value] = null;
		subQuery.distinct = true;
		
		
		
		var elements = [inferredDriver.element, new sparql.ElementSubQuery(subQuery)];
		
		// Add facet constraints
		/ *
		var facetElement = queryGenerator.constraints.getSparqlElement();
		if(facetElement) {
			elements.push(facetElement);
		}* /
		

		
		var element = new sparql.ElementGroup(elements);		
		
		//var result = queryUtils.createFacetQueryCount(element, this.queryGenerator.concept.getVariable());
		//var result = new facets.ConceptInt(element, queryGenerator.concept.getVariable());

		var newDriver = new facets.ConceptInt(element, inferredDriver.variable);

		
		var result = new widgets.QueryGenerator(newDriver, )

		return result;
	};
	*/
	
	
	/**
	 * Select Distinct ?p (Count(?p) As ?c) {
	 *   Select Distinct ?s ?p {
	 *     concept
	 *     {
	 *       Select Distinct ?s { geomElement . Filter(geom In ...) } 
	 *     }   
	 *   }
	 * }
	 * 
	 * If this does not work, I think all we can do is either drop
	 * facet counting (sucks) or fetch all data (might suck)
	 * 
	 * @param uris
	 * @returns A Driver object (element, var)
	 */
	ns.createFacetQueryCountVisibleGeomNested = function(queryGenerator, uris) {

		var concept = queryGenerator.concept;
		var inferredDriver = queryGenerator.getInferredDriver();

		//var geoQueryFactory = this.queryGenerator.createQueryFactory();


		//console.log("queryFactory", queryFactory);

		var subQuery = new sparql.Query();
		var triplesBlock = new sparql.ElementTriplesBlock();
		triplesBlock.addTriples(queryGenerator.geoConstraintFactory.getTriples());
		subQuery.elements.push(triplesBlock);
		
		var geomSrcVar = sparql.Node.v(queryGenerator.geoConstraintFactory.breadcrumb.sourceNode.variable);
		var geomVarStr = queryGenerator.geoConstraintFactory.breadcrumb.targetNode.variable; //geoQueryFactory.geoConstraintFactory.breadcrumb.targetNode.variable;
		var geomVarExpr = new sparql.ExprVar(sparql.Node.v(geomVarStr));
		//console.log("geomVar", geomVar);
		var filterExpr = (uris.length === 0) ? sparql.NodeValue.False : new sparql.E_In(geomVarExpr, uris);
		var filterElement = new sparql.ElementFilter([filterExpr]);

		subQuery.elements.push(filterElement);
		//subQuery.projectVars.add(inferredDriver.variable);
		//subQuery.projectVars.add(concept.getVariable());
		subQuery.projectVars.add(geomSrcVar);
		///subQuery.projection[concept.getVariable().value] = null;
		subQuery.distinct = true;
		
		
		
		var elements = [inferredDriver.element, new sparql.ElementSubQuery(subQuery)];
		
		// Add facet constraints
		var facetElement = queryGenerator.constraints.getSparqlElement();
		if(facetElement) {
			elements.push(facetElement);
		}

		
		var element = new sparql.ElementGroup(elements);		
		
		//var result = queryUtils.createFacetQueryCount(element, this.queryGenerator.concept.getVariable());
		//var result = new facets.ConceptInt(element, queryGenerator.concept.getVariable());

		var result = new facets.ConceptInt(element, inferredDriver.variable);


		return result;
	};
	

	ns.createQueryGeomLonLat = function(geomVar, lonVar, latVar) {
		var element = ns.createElementGeomLonLat(geomVar, lonVar, latVar);
		var result = ns.createQueryGeomLonLatElement(element, geomVar, lonVar, latVar);
		return result;
	};

	ns.createElementGeomLonLat = function(geomVar, lonVar, latVar) {
		var triples = [];
		
		triples.push(new sparql.Triple(geomVar, geo.lon, lonVar));
		triples.push(new sparql.Triple(geomVar, geo.lat, latVar));
		
		var result = new sparql.ElementTriplesBlock(triples);
		return result;			

	};
	

	/**
	 * Select ?geomVar ?lonVar ?latVar { element . }
	 * 
	 * Assumes that the geo-triples (geo:{lon,lat}) are present.
	 */
	ns.createQueryGeomLonLatElement = function(element, geomVar, lonVar, latVar) {
		var result = new sparql.Query();
		result.projectVars.add(geomVar);
		result.projectVars.add(lonVar);
		result.projectVars.add(latVar);

		result.elements.push(element);

		return result;		
	};
	
	/**
	 * This method generates the facet query based on explicely given geometries.
	 * 
	 * @param uris
	 * @returns
	 */
	ns.createFacetQueryCountVisibleGeomSimple = function(queryGenerator, uris) {

		var geoQueryFactory = queryGenerator.createQueryFactory();

		var baseQuery = geoQueryFactory.baseQuery;
		//var baseElement = new sparql.ElementGroup(baseQuery.elements.slice(0)); // create a copy of the original elements
		var elements = baseQuery.elements.slice(0);

		var geomVarStr = geoQueryFactory.geoConstraintFactory.breadcrumb.targetNode.variable;
		var geomVarExpr = new sparql.ExprVar(sparql.Node.v(geomVarStr));
		//console.log("geomVar", geomVar);
		var filterExpr = (uris.length === 0) ? sparql.NodeValue.False : new sparql.E_In(geomVarExpr, uris);
		var filterElement = new sparql.ElementFilter([filterExpr]);
		
		elements.push(filterElement);

		var element = new sparql.ElementGroup(elements);
		
		
		var inferredDriver = this.queryGenerator.getInferredDriver();
		
		var result = queryUtils.createFacetQueryCount(element, inferredDriver.variable);

		return result;
	};

	
	/**
	 * Creates a query that counts the facets for the given visible area:
	 * Nodes that contain too many items are excluded.
	 * 
	 * The structure is:
	 * 
	 * Select Distinct ?p (Count(?p) As ?c) {
	 *   Select Distinct ?s ?p {
	 *       { fragment . Filter(area1) . ?s ?p ?o }
	 *     Union
	 *       { fragment . Filter(area2) . ?s ?p ?o }
	 *     Union
	 *       { ... }
	 *   }
	 * }
	 * 
	 * 
	 * @param bounds
	 * @param nodes
	 * @returns
	 */
	/*
	ns.createFacetQueryCountVisible = function(bounds, nodes) {

		var loadedNodes = ns.AppController.getLoadedNodes(nodes);
		
		
		var geoQueryFactory = this.queryGenerator.createQueryFactory();
		
		// We can either create multiple queries with different bounds ...
		// var query = geoQueryFactory.create(bounds);
		
		// .. or we use the geoConstraintFactory to create multiple geo-constraints
		// and 'or' them together
		//var baseQuery = geoQueryFactory.baseQuery.copySubstitute(function(x) { return x; });
		//baseQuery.type = sparql.QueryType.Select;
		var baseQuery = geoQueryFactory.baseQuery;
		//var baseElement = new sparql.ElementGroup(baseQuery.elements.slice(0)); // create a copy of the original elements
		var baseElements = baseQuery.elements;
		
		var unionElement = new sparql.ElementUnion();
		
		//console.error(baseElement.toString());
		
		var geoConstraintFactory = geoQueryFactory.geoConstraintFactory;

		///var constraintExprs = [];
		
		
		for(var i = 0; i < loadedNodes.length; ++i) {
			var node = loadedNodes[i];

			var nodeBounds = node.getBounds();
			var intersectBounds = nodeBounds.overlap(bounds);
			if(intersectBounds) {
				var geoConstraint = geoConstraintFactory.create(intersectBounds);
				///constraintExprs.push(geoConstraint.getExpr());
				
				var elements = baseElements.slice(0);
				elements.push(new sparql.ElementFilter(geoConstraint.getExpr()));
				
				var unionMember = new sparql.ElementGroup(elements);
				
				
				unionElement.elements.push(unionMember);
			}
		}
		

		// One large filter expression does not work efficiently
		// We create a union instead
		/ *
		var expr = sparql.opify(constraintExprs, sparql.E_LogicalOr);
		var filterElement = new sparql.ElementFilter(expr);
		baseElement.elements.push(filterElement);
		var result = queryUtils.createFacetQueryCount(baseElement, this.queryGenerator.concept.getVariable());
		* /
		
		var result = queryUtils.createFacetQueryCount(unionElement, this.queryGenerator.concept.getVariable());
		
		//console.debug("FacetCounts", result.toString());
		return result;
	};
	*/
	
	/**
	 * @deprecated
	 * 
	 * Creates a query that - based on another query - counts the number of
	 * distinct values for a given variable.
	 * 
	 * TODO Move to some utils package
	 * DONE Change it so it doesn't take a query as arg, but an element - 
	 * 
	 * @param baseQuery
	 * @param limit
	 * @param variable
	 * @param groupVars Optional an array of variables to group by
	 *     TODO Now I finally have to change to projection to a list rather than a map...
	 * @returns {sparql.Query}
	 */
	ns.createQueryCountFromQuery = function(baseQuery, limit, variable, groupVars) {
		//return "Select Count(*) As ?c { { Select Distinct ?n { ?n a ?t ; geo:long ?x ; geo:lat ?y . " +  createBBoxFilterWgs84("x", "y", bounds) + this.createClassFilter("t", uris) + " } Limit 1000 } }";
		
		// Create a new query with its elemets set to copies of that of the baseQuery
		var subQuery = new sparql.Query();
		
		for(var i = 0; i < baseQuery.elements.length; ++i) {
			var element = baseQuery.elements[i];
			var copy = element.copySubstitute(function(x) { return x; });
			
			subQuery.elements.push(copy);
		}
		
		subQuery.projectVars.add(variable);
		///subQuery.projection[variable.value] = null;
		subQuery.distinct = true;
		
		if(limit) {
			subQuery.limit = limit;
		}
		
		var result = new sparql.Query();
		result.projectVars.add(sparql.Node.v("c"), new sparql.E_Count(new sparql.ExprVar(variable)));
		///result.projection["c"] = new sparql.E_Count(new sparql.ExprVar(variable));
		result.elements.push(new sparql.ElementSubQuery(subQuery));

		//console.error(limit);
		//console.error(result.toString());
		
		return result;
	};
	
	
	/**
	 * TODO Is this method used?
	 * 
	 */
	ns.createStatusQuery = function(config) {
		// For each facet get its count by taking the status of the other facets into account.
		//
		var maxCount = 1001;

		var knownFacets = config.getRoot().getSubFacets().asArray();
		
		if(!knownFacets) {
			console.log("No facets to load");
			return;
		}
		
		//console.log("Reloading facets:" , knownFacets);
		/*
		for(var i in open) {
			var facet = 
		}
		*/
		
		//var self = this;

		
		var unionElements = [];
		var p = sparql.Node.v("__p");
		var count = sparql.Node.v("__c");
		for(var i in knownFacets) {
			
			var facet = knownFacets[i];
			
			//console.log("Known facet: ", facet);
			
			var q = new sparql.Query();

			var s = config.conceptVar;
			q.projection.projectVars.add(p);
			q.projection.porjectVars.add(count, new sparql.E_Count(s));
			///q.projection[p.value] = null;
			///q.projection[count.value] = new sparql.E_Count(s);


			var subQuery = new sparql.Query();
			subQuery.limit = maxCount;
			subQuery.elements.push(config.concept);
			subQuery.elements.push(facet.queryElement); //.copySubstitute(facet.mainVar, facetManager.conceptVar);
			subQuery.distinct = true;
			subQuery.projectVars.add(p, new sparql.NodeValue(sparql.Node.uri(facet.id)));
			subQuery.projectVars.add(s);
			///subQuery.projection[p.value] = new sparql.NodeValue(sparql.Node.uri(facet.id));
			///subQuery.projection[s.value] = null;
			//subQuery.projection[count] = new sparql.E_Count(subExpr);
			//subQuery.projection[count] = new sparql.E_Count(new sparql.ExprVar(s));
			//q.elements.push(new sparql.ElementSubQuery(subQuery));

			
			var countWrapper = new sparql.Query();
			countWrapper.projectVars.add(p);
			countWrapper.projectVars.add(count, new sparql.E_Count(new sparql.ExprVar(s)));
			///countWrapper.projection[p.value] = null;
			///countWrapper.projection[count.value] = new sparql.E_Count(new sparql.ExprVar(s));
			
			countWrapper.elements.push(new sparql.ElementSubQuery(subQuery));
			

			unionElements.push(new sparql.ElementSubQuery(countWrapper));
			//batchQuery.
			//this.facetManager. somehow get the configuration as a query
			
			
			// TODO: For each facet we need to get its query element.
			// facet.getQueryElement();
			
			
			// Select Distinct ?p ?c { { Select ?p { <concept> ?concept_var ?p ?o . Filter(?p = <facet>) . } Limit 1001 } }
			
			//this.sparqlService.
		}
		
		//var union = FacetController.balance(sparql.ElementUnion, unionElements);
		

		var batchQuery = new sparql.Query();
		//batchQuery.isResultStar = true;
		batchQuery.projectVars.add(p);
		batchQuery.projectVars.add(count);
		///batchQuery.projection[p.value] = null;
		///batchQuery.projection[count.value] = null;
		batchQuery.elements.push(new sparql.ElementUnion(unionElements));

		console.log("Facet query: " + batchQuery);
		
		return batchQuery;
	};
})(jQuery);
