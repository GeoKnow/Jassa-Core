var Class = require('../../ext/Class');

var FacetSystem = Class.create({
    createFacetService: function(constraints, baseConcept) {
        throw new Error('Override me');
    }
});

module.exports = FacetSystem;
