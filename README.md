## JAvascript Suite for Sparql Access (Jassa)

[![Build Status](http://ci.aksw.org/jenkins/job/Jassa/badge/icon)](http://ci.aksw.org/jenkins/job/Jassa/)

## Important Notes about current Work in Progress

* We are refactoring this repository to contain the JavaScript components of Jassa only. This means, that the Java modules will be moved.
* The concept path finder is now part of the [jena-sparql-api-concepts](https://github.com/AKSW/jena-sparql-api/tree/master/jena-sparql-api-concepts) - DO NOT USE the copy which is currently still part of this repository!


This repository contains several tools for JavaScript based Sparql access. It works both from the client side from the browser and server side with nodejs.

The highlights of this repository are:

* A high level JavaScript API for RDF. Provides core RDF classes (such as Node and Triple), SPARQL classes (such as Query, Element, Expr) and Service classes (such QueryExecutionFactoryHttp, QueryExecutionHttp). If you are familiar with [Apache Jena](http://jena.apache.org), you have most likely seen these names before.
* The _Facete_-API, a powerful faceted search API for generic faceted search on SPARQL endpoints. Under heavy development - TODO Add demo link.
* The _Sponate_-API, a SPARQL-to-JSON mapper which is somewhat similar to [Hibernate](http://hibernate.org) (Sponate = SParql, jsON, hiberNATE). This component unfolds its full potential in combination with latest generation frameworks that keep the DOM and controller logic separate, e.g. [AngularJS](http://angularjs.org/). (Possibly also [Ember.js](http://emberjs.com/), but at present we only develop using the former framework).

## Terminology

You may have noticed that we repeatedly used the term '''class'''. While it is true that plain JavaScript does not offer them (yet), there are however frameworks which introduce this level of abstraction. For Jassa we chose the [Class object](https://github.com/sstephenson/prototype/blob/master/src/prototype/lang/class.js) of the [prototype.js framework](http://prototypejs.org/).

Personal anecdote: Use of classes (and inheritance) at least doubled my JavaScript productivity - if you are working on a sufficiently complex project, never ever listen to the voices that tell you that design is overrated (and there are many in the JS community) - its everything! (TODO Most likely someone famous could be quoted here) ;)

## Module Overview

![Jassa Module Overview](jassa-doc/images/jassa-module-overview.png)


## How to obtain

* npm 

        npm install jassa

* bower; will fetch files from the [jassa-bower release git repo](https://github.com/GeoKnow/Jassa-Bower)

        bower install jassa

* direct download of latest versions from the jassa-bower release git repo
  * [jassa.js](https://raw2.github.com/GeoKnow/Jassa-Bower/master/jassa.js)
  * [jassa.min.js](https://raw2.github.com/GeoKnow/Jassa-Bower/master/jassa.js)


## Dependencies

Jassa depends on the following libraries:

* `jquery`: Asynchronous requests are based on $.ajax
* `prototype`: Only the `Class` object is needed from prototype.
* `underscore`: Provides several utility functions for working with (associative) arrays.
* `underscore.string`: Provides several utility function for working with strings.
* `xmlhttprequest`: NodeJs only; i.e. not needed for browser based set up. This library emulates the browser's XMLHttpRequest object, and makes jQuery's $.ajax work from nodejs. Include it before jQuery.


## Browser-based Set Up

Adjust paths and versions to your needs.

```html
<html>
    <head>
        <script src="resources/libs/jquery/1.9.1/jquery.js"></script>
        <script src="resources/libs/underscore/1.4.4/underscore.js"></script>
        <script src="resources/libs/underscore.string/2.3.0/underscore.string.js"></script>
        <script src="resources/libs/prototype/1.7.1/prototype.js"></script>

        <script src="resources/libs/jassa/0.5.0/jassa.js"></script>

        <script type="text/javascript">
            _.mixin(_.str.exports());

            // The Jassa object is now readily available
            // We hope that the name Jassa is sufficiently exotic to never cause a name clash
            // But who knows. I wished JavaScript had native namespace support...
        console.log("The Jassa object: ", Jassa);
        </script>
    </head>
</html>
```

## NodeJs-based Set Up

Example of a nodejs based set up:

```js
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

$ = require('jquery');

$.support.cors = true;
$.ajaxSettings.xhr = function () {
    return new XMLHttpRequest;
}

require('prototype');

_ = require('underscore');
_.str = require('underscore.string');

_.mixin(_.str.exports());

var Jassa = require('jassa');
```


## Components and Usage

The `Jassa` object defines the following modules

### The `rdf` and `vocab` modules

The `rdf` module holds core RDF classes which are similar to those of Jena.
The `vocab` module defines the following vocabularies (work in progress):

* xsd
* rdf
* rdfs
* owl
* wgs84

These two modules depend on each other (and thus cannot be used separately), because the vocabulary is expressed in
terms of `rdf` classes, however literals require the xsd vocabulary.

Example usage:

```js
var rdf = Jassa.rdf;
var vocab = Jassa.vocab;

var s = rdf.NodeFactory.createVar("s");
var p = vocab.rdf.type;
var o = rdf.NodeFactory.createUri("http://example.org/ontology/MyClass");

var triple = new ns.Triple(s, p, o);

console.log("Triple: " + triple);
console.log("Subject is a variable: " + triple.getSubject().isVar());
```

### The `sparql` module

The `sparql` module contains several classes for the syntactic
representation of SPARQL queries. In addition to the `Query` class, there
alse exist the `Expr` and `Element` class hierarchies known from Apache Jena.

Example usage:

```js
var rdf = Jassa.rdf;
var sparql = Jassa.sparql;

var query = new sparql.Query();
var s = rdf.NodeFactory.createVar("s");
var p = rdf.NodeFactory.createVar("p");
var o = rdf.NodeFactory.createVar("o");

var triple = new rdf.Triple(s, p, o);

query.setElement(new sparql.ElementTriplesBlock([triple]));
query.setResultStar(true);
query.setLimit(10);

console.log("QueryString: " + query);
```

### The `service` module

The service module provides an abstraction layer for communicating with a SPARQL endpoint.

```js
var service = Jassa.rdf;

var qef = new service.QueryExecutionFactoryHttp(
          "http://dbpedia.org/sparql",
          ["http://dbpedia.org"]
);

var qe = qef.createQueryExecution("Select * { ?s ?p ?o } Limit 10");
qe.setTimeout(5000); // timout in milliseconds

qe.execSelect()
    .done(function(rs) {
        while(rs.hasNext()) {
            var binding = rs.nextBinding();
            console.log("Got binding: " + binding);
        }
    })
    .fail(function(err) {
        console.log("An error occurred: ", err);
    });
```

Successful execution of a SPARQL queries yields a `ResultSet` object, which is essentially an iterator over `Binding` objects.
A binding is a map that associates variables with values (instances of `rdf.Node`) or null.
Obviously, this API in principle frees you from the hassle of dealing with a concrete SPARQL result set format.
Currently, the API is only implemented for SPARQL endpoints that yield [Talis RDF JSON](http://docs.api.talis.com/platform-api/output-types/rdf-json).

### Facete

Facete is library for faceted search based on _concepts_ and _constraints_.
Conceptually, a facete-concept is a pair comprised of SPARQL graph pattern and a variable that appears in it.

Facete then allows one to retrieve a concept's properties and sub-properties under a (possibly empty) set of constraints.

TODO Add demo, complete example below (service is missing)

```js
var service = Jassa.service;
var facete = Jassa.facete;

var constraintManager = new facete.ConstraintManager();

var baseVar = rdf.NodeFactory.createVar("s");
var baseConcept = facete.ConceptUtils.createSubjectConcept(baseVar);
var rootFacetNode = facete.FacetNode.createRoot(baseVar);

// Based on above objects, create a provider for the configuration
// which the facet service can build upon
var facetConfigProvider = new facete.FacetGeneratorConfigProviderIndirect(
	new facete.ConceptFactoryConst(baseConcept),
	new facete.FacetNodeFactoryConst(rootFacetNode),
	constraintManager
);

var fcgf = new facete.FacetConceptGeneratorFactoryImpl(facetConfigProvider);
var facetConceptGenerator = fcgf.createFacetConceptGenerator();


var expansionSet = new util.HashSet();
expansionSet.add(new facete.Path());

var facetService = new facete.FacetServiceImpl(qef, facetConceptGenerator);
var facetTreeService = new facete.FacetTreeServiceImpl(facetService, expansionSet);

facetService.fetchFacets()
    .done(function(facetTree) {
        console.log("FacetTree: " + JSON.stringify(facetTree));
    })
    .fail(function(err) {
        console.log("An error occurred: ", err);
    });
```

### Sponate

Sponate is a SPARQL-to-JSON mapper.
TODO Add more description...

```js
var service = Jassa.service;
var sponate = Jassa.sponate;

var prefixes = {
	'dbpedia-owl': 'http://dbpedia.org/ontology/',
	'dbpedia': 'http://.org/resource/',
	'rdfs': 'http://www.w3.org/2000/01/rdf-schema#',
	'foaf': 'http://xmlns.com/foaf/0.1/'
};

var qef = new service.QueryExecutionFactoryHttp('http://dbpedia.org/sparql', ['http://dbpedia.org']);	

var store = new sponate.StoreFacade(qef, prefixes);

store.addMap({
	name: 'castles',
	template: [{
		id: '?s',
		name: '?l',
		depiction: '?d',
		owners: [{
			id: '?o',
			name: '?on'
		}]
	}],
	from: '?s a dbpedia-owl:Castle ; rdfs:label ?l ; '
	     + 'foaf:depiction ?d ; dbpedia-owl:owner ?o .'
	     + '?o rdfs:label ?on .'
	     + 'Filter(langMatches(lang(?l), "en"))'
	     + 'Filter(langMatches(lang(?on), "en"))'
});

var criteria = {name: {$regex: filterText}};
var flow = store.castles.find(criteria).limit(10).skip(10)

flow.asList()
	.done(function(docs) {
	    _(docs).each(function(doc) {
	        console.log("JSON document: " + JSON.stringify(doc));
	    });
	})
	.fail(function(err) {
        console.log("An error occurred: ", err);
	});
```

## Debian Package
TODO: Finish this section
There exists a debian package for the server functionality.

Example

[Concept Path Finder Example](http://localhost:8080/jassa/api/path-finding?service-uri=http://localhost:8800/sparql&source-element=?s%20?p%20?o&source-var=s&target-element=?s%20%3Chttp%3A//www.w3.org/2003/01/geo/wgs84_pos%23long%3E%20?x&target-var=s)

