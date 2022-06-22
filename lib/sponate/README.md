# Sponate Specification

This is WIP...

## Introduction

The Sponate system comprises a JavaScript-based language to express mappings from SPARQL result sets to JavaScript objects, an engine to execute these mappings, and a set of interfaces.
The fundamental principle is, that the JavaScript object tree structures may references to other trees.



## Basic Concepts
* BindingMapper: Maps a binding to a literal value
* Aggregator: A specification for grouping bindings to objects
* Accumulator: Object that accumulates bindings for a specific group

## Template Syntax

### Arrays
The meaning of the array construct depends on the provided arguments.

ISSUE How to create a static array - i.e. an array with a fixed number of items?
  [{ id: '?o}] will create new items for each now id. Maybe it is sufficient if we only set a fixed id?


In general:
* Arrays with functions as the last argument evaluate to an object


* [ '?o' ] An array of objects. By default, distinct / uniq is applied, using the provided comparator.
* [ '?o', {distinct: false}] A second argument can be provided to configure array options.
* [ '?o', function(o) { }] If the last argument is a function, all prior arguments are considered as value references (todo defined referenecs), and will be passed as function arguments in the specified order.
* [ [ '?o' ], function(array) { } ] Declarations can be nested. This example creates an array of objects that is then passed into a transformation function
* [ '?o', '?i' ] Use ?i as the index

Functions can be placed into the sponate context for references by name
context.declare('length', function(x) { return x.length; });
* [ [ '?o' ], 'length' ]  Will yield the length of the array of ?o's


Combinations
* [ '?o', ['?i', function(i) { return i + 1; }]] Create an array of objects based on transforming ?i
* [ '?o', '?i', function(i) { return i + 1; }] This will pass ?o to the function and eventually yield ?o + 1.



* Default Context
comparator

** Functions
'value': yield the literal value for literal nodes, the uri (without <>) for uris, "_:blanknodeid", or identity in any other case
'lang': yield the language attribute.

Issues: Should a warning be issued as the function declares fewer parameters than provided?


names: [[{
    firstName: '?fn',
    lastName: '?ln' }, function(obj) { return obj.firstName + obj.lastName; }]]

### Objects

Objects are created using the combination of
[{
    id: literalExpr
    attr1: subTemplate1
    attrn: subTemplateN
}]

The id attribute is special, as it represents the id of the object in that list.
This specifies a sequence

### Literals


### Value references


```js
context.add({
    name: 'projects',
    template: [{
        id: '?s',
        //displayName: labelAggregator // Aggregator fields cannot be filtered server side.
        name: '?l',
        partners: [{
            id: ['?o', function(o) { return o + 1 }]
            name: '?pl',
            amount: '?a',
        }]
    }],
    from: '?s a fp7o:Project ; rdfs:label ?l ; fp7o:funding [ fp7o:partner [ rdfs:label ?pl ] ; fp7o:amount ?a ]'
});
```


## Programmatic API


```js
var agg =
  new AggObject({
    displayLabel: new AggTransform(new AggBestLabel(bestLabelConfig), NodeUtils.getValue), 
    hiddenLabels: new AggArray(
      new AggTransform(new AggLiteral(new BindingMapperExpr(new ExprVar(o))), NodeUtils.getValue))
    });
```

