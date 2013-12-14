=The Facet module

==Dependencies to other modules
* `sparql`: Constraints are represented as Sparql expressions
* `service`: Sparql service classes, such as `SparqlServiceHttp` 

==Factories
The following base factories exist:
* `ElementFactory`: Provides a `.createElement()` method
* `ConceptFactory`: Provides a `.createConcept()` method
* `QueryFactory`: Provider a `.createQuery()` method

==Paths
* A `Path` is a sequence of steps.
* A `Step` holds the following information:

        class Step {
        	String propertyName;
        	boolean isInverse;
        }  

The attribute `isInverse` indicates whether to follow the property in forward or backward direction.
In the future we may extend the Step class to make use of Sparql 1.1 property paths and
Sparql 1.1 basic federation using the `Service` keyword.


==Concepts
Issue: How to unify intensional and extensional concepts?
The goal is to make them interchangeably - i.e:


One idea is, to represent an extensional concept as
(Filter(?s In ($concreteList$)), ?s); just a filter with an IN expression and without any triple pattern


Alternatively, we could create subclasses of Concept, such as ConceptInt, ConceptExt, (what about SubjectConcept?)
The '.getElement()' method of an extensional concept would then return a filter element according to above's pattern.
Because the element is extensional, we know that there is no triple pattern part of the element; which can be exploited in query generation.
Then again, a "hasTriplePattern" method might be better; more direct; fewer implications.

Ok, but having a query with a huge filter pattern is not going to work out anyway, so if we really want
to have this concept thing interchangebly, we would have to define a workflow (i.e. joins),
and at each node we would decide on whether to push the join into the query, or to execute it from the client.
For this perspective, we don't really need a class for extenional concepts; just a class to execute a query
with a list of bindings (and a binding cache).


==Constraints

TODO Clarify the types of constraints that exist. For example:
* Constraints are object that can be instanciated on a given facetNode, i.e.
ElementDesc ed = constraint.instanciate(facetNode).

The element desc then holds the triple patterns and filters.


* `ConstraintManager`: Acts as a collection for constraints and offers methods for creating elements
* `PathExpr`:  Bundles an expression with a map that assigns variables to paths. Java pendant: Pair<Expr, Map<Var, Path>>.


We can distinguish between a constraint declaration, its instance and its implementation.
This is similar to a function declaration, implementation and call.

* The declaration declares the name and the arguments which it takes - its essentially a signuature. Maybe this is a nice to have which we can postpone implementing.
* A constraint instance binds a constraints with arguments.
* The implementation is reponsible for mapping a constraint instance (well, the arguments), to some sparql element. 






==FacetTreeService
* The facetTree 


* searchPaths(searchString, depth): This method actually requires a server API. The reason is that we need a
join summary, which does not make sense to compute in the client.








==FetchStrategies:
Fetch stratgies encapsulate workflows for retrieving data from the server.

* The first step is to obtain the concept for the facets at the node.
  Based on this concept we can fetch e.g. the first ten items. However:
  these items are based on an aggregation (Select Distinct ?p { ?s ?p ?o }
  So the actual data for the aggregation could be too big to scan in real time.
  This means, if we need to assume that the aggregation may fail.
   
  In contrast to the data-table, where we can 

If we can assume that predicates always have labels, we can do this, which is blazingly fast:
But this means supporting constraints on the properties.

So instead of doing the extremely expensive
Select Distinct ?p { ?s ?p ?o }

We may get an equivalent result doing:
Select Distinct ?p { ?p a rdf:Property }

I guess this only applies to the root node.


SELECT Distinct ?p WHERE {
  ?s a lgdo:Amenity .
  ?s ?p ?o
}

->
SELECT Distinct ?p WHERE {
  ?s a lgdo:Amenity .
  ?s ?p ?o .
  ?p a rdf:Property .
}



Outgoing vs Ingoing properties:

Get all outgoing properties of things that are 
Select Distinct { ?s a ex:Foo . ?s ?p ?o }



# This does not work: every
#Select Distinct ?p { ?p rdfs:label ?l . ?s ?p ?o }


select distinct ?p { ?p rdfs:label ?l Filter(bif:contains(?l, "type")) }

Or maybe even better:
select distinct ?p { ?p a rdf:Property ; rdfs:label ?l Filter(bif:contains(?l, "type")) }


In this case, we would not use { baseConcept ?s ?p ?o
  

If a property only has few distinct values, we could optimize fetching the subfacets by
using the concrete distinct values rather then the concept that created them.
In general, here the goal of Jassa should be to allow easy switching between these stratgies -
(i.e. substitution of a concept with its extension)
  

   * `baseConcept : Concept`
 * `rootFacetNode : FacetNode`
 * `constraintManager : ConstraintManager`
 * and a `sparqlService : SparqlService`
 



 
Using sparql expressions as constraints:

template = new ConstraintSpecTemplateSparqlExpr(new E_Equals(new ExprVar("s"), NodeValue.makeInt(5))); 

var varMap = {
	's': Path.parse("http://foo.bar")
}

template.createConstraintSpec(varMap);


// Immutable
ConstraintSpecExpr = {
	intialize: function(expr, varToPath) {
	    this.expr = expr;
	    this.varToPath = varToPath;
	}
}

// Mutable
ConstraintSpecExprFactory = Class.create() {
	initialize: funciton(expr) {
		this.expr = expr;
		this.varToPath = new util.HashMap();
	},
	
	addMap(var, path) {
	    this.varToPath.put(var, path);
	}
}

e.g.

CseFactories.createEquals({ '?s': somePath})
 


If we wanted to find affected paths by a constraint, we could also check its corresponding element
whether it refers to variables that map back to paths...


PartiallyBound / DefaultBound Templates...


the constraint spec can be an arbitrarily structured object.
The only thing it must provide is the declared path(s) to which it is bound


## Facet Tree Facade Configuration
rootConcept: (?s ?p ?o, ?s) or (?s a rdfs:Property)

facetFetchStrategy:
- fetch properties and corresponding counts in a single query (global ordering possible)

- fetch a subset of properties first, then count all properties in the subset at once (no global ordering possible)
- onerror:
    - do binary partition
    - try to count each property separately
- fetch a subset of properties first, then count properties individually


## Facete + Sponate
For each facet we want the most appropriate labels - how to get them efficiently?
 -> Query Cache can cache the set of bindings under conditions, but no aggregation!
 -> Sponate offers aggregation and label util
 
Could we add some recursive support to Sponate???
Possibly through introduction of parameterized templates - such as facetTree(?s)

var recSponateTemplate = {
	name: 'recTest',
	template: [{
	    id: '?s',
	    children: [{$config: {
	    	ref: 'recTest',
	    	params: [?s],
	    	// what's the stop condition for the recursion?
	    }]
	}],
	from: function(parent, v) { /* magically build a path */; return facetTreeQueryGen.createFacetElement(path); }
}

...




 
 
 
 