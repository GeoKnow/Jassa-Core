#The Jassa SPARQL module

## Introduction
This module provides classes for creating SPARQL queries.
It mimics some of the SPARQL classes of the [Apache Jena](http://jena.apache.org) project.


## Example Usage of the `sparql` module

The `sparql` module contains several classes for the syntactic
representation of SPARQL queries. In addition to the `Query` class, there
alse exist the `Expr` and `Element` class hierarchies known from Apache Jena.

```js
var rdf = jassa.rdf;
var sparql = jassa.sparql;

var query = new sparql.Query();
var s = rdf.NodeFactory.createVar("s");
var p = rdf.NodeFactory.createVar("p");
var o = rdf.NodeFactory.createVar("o");

var triple = new rdf.Triple(s, p, o);

query.setQueryPattern(new sparql.ElementTriplesBlock([triple]));
query.setResultStar(true);
query.setLimit(10);

console.log("QueryString: " + query);
```

## Misc

These resources are useful entry points to see which SPARQL classes are available:

* [SPARQL Expression Classes](https://github.com/GeoKnow/Jassa-Core/blob/master/jassa-js/src/main/webapp/resources/js/sparql/expr/)
* [SPARQL Element Classes](https://github.com/GeoKnow/Jassa-Core/blob/master/jassa-js/src/main/webapp/resources/js/sparql/element/)

