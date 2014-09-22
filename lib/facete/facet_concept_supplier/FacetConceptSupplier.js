var Class = require('../../ext/Class');

/**
 * Instances of this class are used by (sparql-) concept based
 * facet services to obtain the concept at a certain pathHead.
 *
 * For example, this supplier can be configured to return the list
 * of _declared_ properties - such as (?p | ?p a rdf:Property) - for the root path,
 * rather than returning a concept representing the actual set of properties
 * - such as (?p | ?s ?p ?o)
 *
 */
var FacetConceptSupplier = Class.create({
    getConcept: function(pathHead) {
        throw new Error('Override me');
    },
});

module.exports = FacetConceptSupplier;
