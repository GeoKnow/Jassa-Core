## TODOS

* Make the FacetConceptSupplier Configurable, so it is possible to switch between e.g declared and used properties
 * Currently this is hard coded in facete/FacetServiceUtil.createFacetConceptSupplier(facetConfig)
 * But it should go to the FacetServiceBuilder


## Extending Object Templates

A `sponate.MappedConcept` is a template for creating objects based on a (SPARQL) service. (-> Actually we could generalize it to any service).

We could exploit the `$ref` feature to work with lookup services:

{
  id: '?s',
  labelInfo: { $ref: { target: lookupService , on: '?s' } },
}


Issue: Can we also do concept based lookups with listServices?

{
  id: '?s',
  labelInfo: { $ref: { target: listService , on: '?o' } },
}
from: '?s directorOf ?o'

listService.fetchItems(({?s directorOf ?o}, ?o))


If we use a mappedConcept, we could even join it in (the Sponate Engine will take care of that):

{
    id: '?s',
    labelInfo: { $ref: { target: mappedConcept, on: '?foo', join: true } } // For mappedConcepts we could implement this kind of join support
}


So, actually all that is missing is having some meaningful API on AggObject.

We could subclass AggObject to e.g. AggObjectCustom


.add('attr', object)
  -> object can be:
 * sponate template
 * var
 * expr
 * mappedConcept
 * lookupService
 * listService


//So what gives me a headache is, that the add method needs to be bound to a sponate-context,
//so the AggObjectCustom must have the reference as well.

Hm, actually... the reference to the parser should be sufficient...







