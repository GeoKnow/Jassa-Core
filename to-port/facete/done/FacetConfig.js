var Class = require('../ext/Class');

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
        this.baseConcept = baseConcept;
        this.rootFacetNode = rootFacetNode;
        this.constraintManager = constraintManager;
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

ns.FacetConfig.createDefaultFacetConfig = function() {
    var baseVar = rdf.NodeFactory.createVar("s");
    var baseConcept = ns.ConceptUtils.createSubjectConcept(baseVar);
    //var sparqlStr = sparql.SparqlString.create("?s a ?t");
    //var baseConcept = new ns.Concept(new sparql.ElementString(sparqlStr));
    var rootFacetNode = ns.FacetNode.createRoot(baseVar);

    var constraintManager = new ns.ConstraintManager();
    
    var result = new ns.FacetConfig(baseConcept, rootFacetNode, constraintManager);
    return result;
};

module.exports = FacetConfig;
