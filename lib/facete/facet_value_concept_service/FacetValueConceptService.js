var Class = require('../../ext/Class');

/**
 * Service for creating facet value concepts
 *
 * The idea is to later have implementations
 * that can replace intensional parts of the generated concept with extensions,
 * e.g. replacing 'countries in europe' with their explicit enumeration.
 * This is more important for e.g. regex and fuzzy matches, where a prior match result
 * could be used directly
 */
var FacetValueConceptService = Class.create({
    prepareConcept: function(path, excludeSelfConstraints) {
        throw new Error('Method not overridden');
    }
});

module.exports = FacetValueConceptService;
