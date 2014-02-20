#The Jassa-Facete module (WIP)

## Introduction
This module provides classes for faceted search over data in SPARQL endpoints.

## Demo

Some concepts may be somewhat sophisticated, so its best to have a look at the demos to get a feeling of what the project can do for you.


## Know Issues

* The `Concept` class is currently in the `facete` but will be moved into the `sparql` one. This documentation already uses the sparql namespace.

## Concepts

In order to understand the faceted search module, you should familiarize yourself with the following key concepts first:

* A _SPARQL concept_ is a pair comprised of a basic graph pattern (BGP) and a variable thereof. In the following we will refer to a SPARQL concept simply as _concept_. For example, the concept `({?s a Person ; born ?year. Filter(?year = 1900), ?s)` may describe the set of people born in 1900. A concept thus denotes a set of resources.
* _Paths_ are used to navigate from a concept _A_ to a related concept _B_. A path is a sequence of _steps_, whereas a step is a pair comprised of a property name and a direction. The direction indicates whether to follow the property in forward or backward direction.
For example, the path `[(department, forward)]` may be used to navigate from a concept, such as people, to the set of departments where they work. Conversely, the path `[(department, backward)]` may be used to navigate from departments backwards to the people.
* For each concept, we can create a related concept denoting the set of outgoing or incoming properties: For example, based on
`({?s a Person}, ?s)` we can derive `({?s a Person ; ?p ?o}, ?p)`.

* _Constraints_ on facets are expressed using _constraint spec(ification)s_.
Constraint specs may hold information such as `(constraintType, path, value) = ('equal', '[born]', 1900)` which may be translated by a _constraint spec interpreter_ into a SPARQL element such as `{ ?s born ?v\_1. Filter(?v\_1 = 1900)}`. Constraint specs thus abstract from raw SPARQL. There are two good reasons for this approach: (1) the spec does not need to know the SPARQL variable(s) it is constraining, and (2) the specs should be easier to transform into human readable description to be displayed in the user interface rather than SPARQL elements.

* A _facet_ corresponds to a path.
* _facet count_ refers to how many distinct values there are for a facet.
* _facet values_ denotes the set of values for a facet.
* _facet value count_ refers to the number of distinct resources having a certain value for the given facet.

TODO Add screenshot with labels

## Usage

### Overview

_All classes are located in `Jassa.facete.{}`_.

The essential classes of the facete module are:

* `FacetTreeService`: This is the most high level class of the facete module. It supports retrieving a JSON document that holds information about facets according to its configuration. Internally, it builds on the FacetService.
* `FacetService`: A service class for fetching facets, facet counts and facet values and facet value counts for a given path.

The services are configured with a `FacetTreeConfig` and a `FacetConfig`, respectively, whereas the FacetTreeConfig contains a reference to a FacetConfig. 


### Configuration

FacetConfig
    baseConcept;
    rootFacetNode;
    constraintManager;

FacetTreeConfig


### Service instantiation


### Service usage


## Components



* `FacetTreeConfig`


* `facetNode` (subject to renaming): Essentially a map from paths to variable names. 
* `Concept`:
```javascript
class FacetConfig
    baseConcept;
    rootFacetNode;
    constraintManager;
```

### Constraint API

* (ConstraintManager)[https://github.com/GeoKnow/Jassa/blob/master/jassa-js/src/main/webapp/resources/js/facete/facete-constraint-manager.js]: 
The ConstraintManager comprises three aspects:
 * It holds a collection of constraint specification objects
 * It is a registry for factories that create SPARQL elements from the constraint specifications.
 * It is a factory for creating a SPARQL element implementing the constraints specified by the prior items.


```javascript
var constraintManager = new facete.ConstraintManager();

// Create a constraint that specifies that the givenName must equal 'Wayne'
var givenNamePath = facete.Path.parse('http://xmlns.com/foaf/0.1/givenName');
var wayneNode = rdf.NodeFactory.createPlainLiteral('Wayne');
var c1 = new facete.ConstraintSpecPathValue('equal', givenNamePath, wayneNode);
constraintManager.addConstraint(c1);

// Require for a firstName property to exist
var firstNamePath = facete.Path.parse('http://xmlns.com/foaf/0.1/firstName');
var c2 = new facete.ConstraintSpecPath('exist', firstNamePath);

// Use .toggleConstraint to switch a constraint on or off (relies on the constraint's equality functions)
constraintManager.toggleConstraint(c2);

// Retrieve the constraints and show them
// Note: This is a low level method
var elements = constraintManager.createElements(new facete.Path());
console.log('Elements: ' + elements);
```;


// High level API
var facetConceptGenerator = facete.FaceteUtils.createFacetConceptGenerator(facetConfig);
var concept = facetConceptGenerator.createConceptResources(path, true);



ConstraintSpecs must provide the interface `facete.ConstraintSpec`:

```javascript
	interface ConstraintSpec {
        // The name (or rather type) of the constraint, such as 'equals' or 'exist'.
		String getName();
		
        // The array of paths which are affected by the constraint.
		sparql.Path[] getDeclaredPaths();

        // Functions for determining the equality of constraint specs (TODO should go to a base class)
		boolean equals();		
		String hashCode();
	}

```
The subclass ConstraintSpecPathValue adds a path and value field, 



