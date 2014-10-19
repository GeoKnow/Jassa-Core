##The Jassa RDF module

### Introduction
This module, which is part of the "JAscript Suite for Sparql Access (Jassa)", contains core RDF classes which can serve as a solid foundation for JavaScript-based Semantic Web libraries and applications.
The design of this module follows closely the one of the [Apache Jena](http://jena.apache.org) Java project.

### Architecture
Jassa uses `prototype.js`'s `Class` object which offers a high level abstraction for the definition of interfaces and the creation of inheritance hierarchies.

### Usage
All classes reside in the `rdf` namespace of the Jassa object:

    <!-- Required libraries -->
    <script src="jquery.js"></script>
    <script src="underscore.js"></script>
    <script src="underscore.string.js"></script>
    <script src="prototype.js"></script>

    <script src="jassa.js"></script>
    ...
    var rdf = Jassa.rdf;



### Example usage of the `rdf` and `vocab` modules

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


### Public API

The RDF module is based on the files [rdf-core.js](rdf-core.js) and [rdf-literals.js](rdf-literals.js).
This separation exists because literals require the xsd vocabulary, whereas the xsd vocabulary is expressed using classes of `rdf-core.js`.

_Note: Jena uses the spelling for 'URI', whereas Jassa uses the spelling 'Uri'._


* The `Node` hierarchy. This is the same hierarchy as used in Jena. `Node` is an interface with the concrete implementations `Node_Blank`, `Node_Uri`, `Node_Literal`, and `Node_Variable`. It is recommended to create instances of `Node` using the `NodeFactory`. In practice, one should only rely on the `Node` interface. In general, all methods below return the appropriate result for the node if applicable, otherwise they should die horribly.
 * `String getUri()`: Returns the URI.
 * `String getName()`: Returns the variable name.
 * `AnonId getBlankNodeId()`: Returns the blank node it object (this object is only required to be comparable).
 * `String getBlankNodeLabel()`: Returns a string representation of the blank node id
 * `LiteralLabel` getLiteral()`: Returns the `LiteralLabel` object for literals. This object holds `value`, `lexicalForm`, `datatype` and `language`, but is itself not bound to the `Node` hierarchy.
 * `Object getLiteralValue()`: Returns the object of the literal.
 * `String getLiteralLexicalForm()`: Returns the lexical form of the literal.
 * `RdfDatatype getLiteralDatatype()`: Returns the RDF Datatype object. RdfDatatype bundles a URI with a `Object parse(String lexicalForm)` and `String unparse(Object value)` methods.
 * `String getLiteralDatatypeUri()`: Returns the URI of the RDF datatype.
 * `boolean isBlank()`: true iff the node corresponds to a blank node.
 * `boolean isUri()`: true iff the node corresponds to a URI.
 * `boolean isLiteral()`: true iff the node corresponds to a literal.
 * `boolean isVariable()`: true iff the node represents a variable.
 * `boolean equals(Node)`: Compares two nodes for equivalence.

* `AnonId`: Interface for blank node ids.
 * `AnonIdStr`: Create an instance of an AnonId using `var anonId = new rdf.AnonIdStr("myBlanknodeLabel");`
* `NodeFactory`: This class provides a set of static methods for the creation of Node objects:
 * `Node createUri(String uri)`: Creates a new URI node
 * `Node createVar(String varName)`: Creates a new varible node
 * `Node createAnon(AnonId anonId)`: Creates a new blank node.
 * `Node createTypedLiteralFromValue(Object value, String typeUri)`: Creates a literal node. The value is unparsed to its lexical form according to `typeUri`.
 * Node createTypedLiteralFromString(String value, String typeUri)`: Creates a literal node. The string is parsed to a JavaScript object according to `typeUri`.


