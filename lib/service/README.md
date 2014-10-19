### Example usage of the `service` module

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

