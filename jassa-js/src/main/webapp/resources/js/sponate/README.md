## Sponate: Tackling the SPARQL-JSON impedance mismatch

Launched Sept 28 2013. As of Oct 4, 2013, there is only (or already) a teaser yet.

### Motivation and Vision
JSON and template engines go together like butter and bread for creating awesome HTML views with little or no coding.\* 
The same relation holds between SPARQL and Open Data: up to now, this is probably one of the best ways to publish data in an easily reusable way.\*\*
However, combining SPARQL with JSON is often painful, as the data models simply don't match up.

This pain is similar to the one which one encounters when mapping between relational database management systems and object oriented languages.

And this is where Sponate jumps in.
'Sponate' mixes the technologies SParql, jsON, hiberNATE, but also [Jena](http://jena.apache.org/), and [mongoDB](http://docs.mongodb.org). And for the teaser also angular.
Sponate allows one declare mappings between SPARQL elements and JSON document templates. Queries can be performed over these JSON templates using a mongoDB like API.


\* If you are unfamiliar with template engines, check out [angular](http://angularjs.org/),  [handlebars](http://handlebarsjs.com/), [mustache](http://mustache.github.io/), or have a look at the [template-engine-chooser](http://garann.github.io/template-chooser/)

\*\* A discussion is out of scope, but the main reasons are:
* SPARQL is a standardized query language for web databases, and those databases are becoming increasingly popular with the growth of the [LOD cloud](http://lod-cloud.net/).
* The underlying data model, called `RDF`, makes it possible to create links between individual pieces of data, which is not possible to this extent using formats such as JSON, XML, CSV and so on.
* And with RDF in some cases people are actually finding consensus on quasi-standard schemas for common modeling problems.


### Components
Sponate is a module of the JAvascript Suite for Sparql Access (JASSA), which is structured as follows:

* `Jassa.rdf`: A port of some core Jena classes. The most prominent class is [Jassa.rdf.Node](https://github.com/GeoKnow/Sponate/blob/master/jassa-js/src/main/webapp/resources/js/rdf/rdf-core.js).
* `Jassa.sparql`: A port of some Jena sparql classes. These are used to create queries in a structured fashion. Builds on top of the rdf namespace.
* `Jassa.sponate`: The sponate system is located in this namespace and builds on top of the other two.


If you have used Java jena before, you will notice that the interfaces are (almost) identical.


### Teaser
A simple demo is already working and available [here](http://cstadler.aksw.org/jassa/sponate/).
It works directly on DBpedia and creates a table showing castles together with their list of owners (some have more than 1).
Have a look at the source code how it is done - it's less than 100 lines.


    var service = sponate.ServiceUtils.createSparqlHttp('http://dbpedia.org/sparql', ['http://dbpedia.org']);
    var store = new sponate.StoreFacade(service, prefixes);

    store.addMap({
        name: 'castles',
        template: [{
            id: '?s',
            name: '?l',
            owners: [{
                id: '?o',
                name: '?on'
            }]
        }],
        from: '?s a dbpedia-owl:Castle ; rdfs:label ?l ; dbpedia-owl:owner ?o . ?o rdfs:label ?on . Filter(langMatches(lang(?l), "en")) . Filter(langMatches(lang(?on), "en"))'
    });
	

    // This is a mongoDB like interface - the goal is to reach interoperability
    store.castles.find({id: {$eq: '<http://dbpedia.org/resource/Hume_Castle>'}});


### Getting involved
Interested in contributing? Drop me a mail, see [here for my email](http://aksw.org/ClausStadler).

### Planned features
* Add support for rewriting criterias to SPARQL filters
* Add support for limit and offset
* Add support for order by
* Add support for references/relations (oneToOne and oneToMany) between mappings
* Add support for lazy fetching of relations based on 'hibernate-like' proxy objects
* Test and polish
* Integrate the faceted search components of the Faceted SPARQL browser [Facete](https://github.com/GeoKnow/Facete).


This project is part of [GeoKnow](http://geoknow.eu/) and maintained by the [AKSW](http://aksw.org/) research group.


