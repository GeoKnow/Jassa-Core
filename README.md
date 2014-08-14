## JAvascript Suite for Sparql Access (Jassa) Core

[![NPM version](https://badge.fury.io/js/jassa-core.svg)](http://badge.fury.io/js/jassa-core) 
[![Code Climate](https://codeclimate.com/github/GeoKnow/Jassa-Core.png)](https://codeclimate.com/github/GeoKnow/Jassa-Core) 
[![Dependency Status](https://gemnasium.com/GeoKnow/Jassa-Core.svg)](https://gemnasium.com/GeoKnow/Jassa-Core)  

* Master branch:  
[![Build Status](https://travis-ci.org/GeoKnow/Jassa-Core.png?branch=master)](https://travis-ci.org/GeoKnow/Jassa-Core)
[![Coverage Status](https://coveralls.io/repos/GeoKnow/Jassa-Core/badge.png?branch=master)](https://coveralls.io/r/GeoKnow/Jassa-Core?branch=master) 

* Develop branch:  
[![Build Status](https://travis-ci.org/GeoKnow/Jassa-Core.png?branch=develop)](https://travis-ci.org/GeoKnow/Jassa-Core)
[![Coverage Status Develop](https://coveralls.io/repos/GeoKnow/Jassa-Core/badge.png?branch=develop)](https://coveralls.io/r/GeoKnow/Jassa-Core?branch=develop)

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

## How to build/test

1. Make sure you have latest node.js installed
2. Install [gulp](http://gulpjs.com/) with `npm -g install gulp`
3. Clone this repo
4. `cd` into repo folder and run `npm install`

Now you can run `gulp` to see if the tests complete as well as results for code covarage.

## Browser-based Set Up

TODO: add explanation here

```html
<html>
    <head>
        <script src="resources/libs/jassa/0.5.0/jassa.js"></script>

        <script type="text/javascript">
            // Init jassa with native promise and jquery.ajax
            var jassa = new Jassa(Promise, $.ajax);

            // The jassa object is now readily available
            // We hope that the name Jassa is sufficiently exotic to never cause a name clash
            // But who knows. I wished JavaScript had native namespace support...
            console.log("The Jassa object: ", jassa);
        </script>
    </head>
</html>
```

## NodeJs-based Set Up

Example of a nodejs based set up:

```js
// require libraries
var Promise = require('bluebird');
var request = Promise.promisifyAll(require('request'));

// create ajax function for sending requests
var ajax = function(param) {
    return request.postAsync(param.url, {
        json: true,
        form: param.data,
    }).then(function(res) {
        return new Promise(function(resolve) {
            resolve(res[0].body);
        });
    });
};

// init jassa with loaded Promise and ajax request function
var jassa = require('jassa')(Promise, ajax);
```

## Components and Usage

The `jassa` object defines the following modules

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
var rdf = jassa.rdf;
var vocab = jassa.vocab;

var s = rdf.NodeFactory.createVar("s");
var p = vocab.rdf.type;
var o = rdf.NodeFactory.createUri("http://example.org/ontology/MyClass");

var triple = new rdf.Triple(s, p, o);

console.log("Triple: " + triple);
console.log("Subject is a variable: " + triple.getSubject().isVariable());
```

### The `sparql` module

The `sparql` module contains several classes for the syntactic
representation of SPARQL queries. In addition to the `Query` class, there
alse exist the `Expr` and `Element` class hierarchies known from Apache Jena.

Example usage:

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

### The `service` module

The service module provides an abstraction layer for communicating with a SPARQL endpoint.

```js
var service = jassa.service;

var sparqlService = new service.SparqlServiceHttp(
          "http://dbpedia.org/sparql",
          ["http://dbpedia.org"]
);

var qe = sparqlService.createQueryExecution("Select * { ?s ?p ?o } Limit 10");
qe.setTimeout(5000); // timout in milliseconds

qe.execSelect()
    .then(function(rs) {
        while(rs.hasNext()) {
            var binding = rs.nextBinding();
            console.log("Got binding: " + binding);
        }
    })
    .catch(function(err) {
        console.log("An error occurred: ", err);
    });
```

Successful execution of a SPARQL queries yields a `ResultSet` object, which is essentially an iterator over `Binding` objects.
A binding is a map that associates variables with values (instances of `rdf.Node`) or null.
Obviously, this API in principle frees you from the hassle of dealing with a concrete SPARQL result set format.
Currently, the API is only implemented for SPARQL endpoints that yield [Talis RDF JSON](http://docs.api.talis.com/platform-api/output-types/rdf-json).

