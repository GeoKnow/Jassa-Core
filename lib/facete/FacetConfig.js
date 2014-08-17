var Class = require('../ext/Class');

var FacetNode = require('./FacetNode'); 
var ConstraintManager = require('./ConstraintManager');

/**
 * The FacetConfig holds the most essential information for creating the facet tree
 *
 * Filtering by labels, ordering by scores and tagging the data are to be
 * implemented as additional layers on top of concepts created from this information
 *
 * @param {jassa.sparql.Concept} The concept specifying the initial set of resources
 * @param {jassa.facete.FacetNode} A mapping from path to allocated variables
 * @param {jassa.facete.ConstraintManager} The set of active constraints
 *
 */
var FacetConfig = Class.create({
    classLabel: 'jassa.facete.FacetConfig',
    
    initialize: function(baseConcept, rootFacetNode, constraintManager) {
        this.baseConcept = baseConcept || ConceptUtils.createSubjectConcept();
        this.rootFacetNode = rootFacetNode || FacetNode.createRoot(this.baseConcept.getVar());
        this.constraintManager = constraintManager || new ConstraintManager();
    },
    
    getBaseConcept: function() {
        return this.baseConcept;
    },
    
    setBaseConcept: function(baseConcept) {
        this.baseConcept = baseConcept;
    },
    
    getRootFacetNode: function() {
        return this.rootFacetNode;
    },
    
    setRootFacetNode: function(rootFacetNode) {
        this.rootFacetNode = rootFacetNode;
    },
    
    getConstraintManager: function() {
        return this.constraintManager;
    },
    
    setConstraintManager: function(constraintManager) {
        this.constraintManager = constraintManager;
    },
    
});

module.exports = FacetConfig;
