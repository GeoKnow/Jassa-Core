var Concept = require('../sparql/Concept');
var Relation = require('../sparql/Relation');

var FacetConceptUtils = {

    /**
     * Create a concept for the set of resources at a given path.
     * Note that this is distinct from the facets and the facet values:
     * If the facets are properties, and the facet values are objects, then
     * this this is the subjects.
     *
     */
    createConceptResources: function(facetConfig, path, excludeSelfConstraints) {
        var baseConcept = facetConfig.getBaseConcept();
        var rootFacetNode = facetConfig.getRootFacetNode(); 
        var constraintManager = facetConfig.getConstraintManager();

        var excludePath = excludeSelfConstraints ? path : null;         

        var elementsAndExprs = constraintManager.createElementsAndExprs(rootFacetNode, excludePath);
        var constraintElements = elementsAndExprs.getElements();
        var constraintExprs = elementsAndExprs.getExprs();

        var facetNode = rootFacetNode.forPath(path);
        var facetVar = facetNode.getVar();

        var baseElements = baseConcept.getElements();
        var pathElements = facetNode.getElements();

        var facetElements = []; 
        facetElements.push.apply(facetElements, pathElements);
        facetElements.push.apply(facetElements, constraintElements);

        if(baseConcept.isSubjectConcept()) {
            if(facetElements.length == 0) {
                facetElements = baseElements;
            }  
        } else {
            facetElements.push.apply(facetElements, baseElements); 
        }

        var filterElements = _(constraintExprs).map(function(expr) {
            var element = new sparql.ElementFilter(expr);
            return element;
        });
        
        facetElements.push.apply(facetElements, filterElements);

        // TODO Fix the API - it should only need one call
        var finalElements = sparql.ElementUtils.flatten(facetElements);
        finalElements = sparql.ElementUtils.flattenElements(finalElements);
        
        //var result = new ns.Concept(finalElements, propertyVar);
        var result = ns.Concept.createFromElements(finalElements, facetVar);
        return result;
    },

    /**
     * Creates a concept that fetches all facets at a given path
     *
     * Note that the returned concept does not necessarily
     * offer access to the facet's values (see first example).
     * 
     * Examples:
     * - ({?s a rdf:Property}, ?s)
     * - ({?s a ex:Foo . ?s ?p ?o }, ?p)
     * 
     * TODO We should add arguments to support scanLimit and resourceLimit (such as: only derive facets based on distinct resources within the first 1000000 triples)
     * 
     */
    createConceptFacets: function(path, isInverse) {
        var relation = this.createRelationFacets(path, isInverse, true);

        var relation.Concept();
        var result = new ns.Concept.createFromElements(facetConcept.getElements(), facetConcept.getFacetVar());
        return result;
    },

    
    /**
     * Creates a relation that relates facets to their values.
     * Example ({ ?s a Airport . ?s ?p ?o}, ?p , ?o)
     *
     * Common method to create concepts for both facets and facet values.
     *
     * This method is the core for both creating concepts representing the set
     * of facets as well as facet values.
     *
     * TODO Possibly add support for specifying the p ond o base var names
     * 
     * @param path The path for which to describe the set of facets
     * @param isInverse Whether at the given path the outgoing or incoming facets should be described
     * @param enableOptimization Returns the concept (?p a Property, ?p) in cases where (?s ?p ?o, ?p) would be returned.
     * @param singleProperty Optional. Whether to create a concept where only a single property at the given path is selected. Useful for creating concepts for individual properties
     */
    createRelationFacets: function(facetConfig, path, isInverse, singleProperty) {

        var baseConcept = facetConfig.getBaseConcept();
        var rootFacetNode = facetConfig.getRootFacetNode(); 
        var constraintManager = facetConfig.getConstraintManager();

        var singleStep = null;
        if(singleProperty) {
            singleStep = new ns.Step(singleProperty.getUri(), isInverse);
        }

        var excludePath = null;
        if(singleStep) {
            excludePath = path.copyAppendStep(singleStep);
        }

        var elementsAndExprs = constraintManager.createElementsAndExprs(rootFacetNode, excludePath);
        var constraintElements = elementsAndExprs.toElements();

        var facetNode = rootFacetNode.forPath(path);
        var facetVar = facetNode.getVar();

        var baseElements = baseConcept.getElements();

        var facetElements; 
        if(baseConcept.isSubjectConcept()) {
            facetElements = constraintElements;
        } else {
            facetElements = baseElements.concat(constraintElements); 
        }

        var varsMentioned = sparql.PatternUtils.getVarsMentioned(facetElements); //.getVarsMentioned();
        
        var propertyVar = VarUtils.freshVar('p', varsMentioned);
        var objectVar = VarUtils.freshVar('o', varsMentioned);

        var triple = isInverse
            ? new rdf.Triple(facetVar, propertyVar, objectVar)
            : triple = new rdf.Triple(objectVar, propertyVar, facetVar);

        facetElements.push(new sparql.ElementTriplesBlock([triple]));

        if(singleStep) {
            var exprVar = new sparql.ExprVar(propertyVar);
            var expr = new sparql.E_Equals(exprVar, sparql.NodeValue.makeNode(singleProperty));
            facetElements.push(new sparql.ElementFilter(expr));
        }

        var pathElements = facetNode.getElements();
        facetElements.push.apply(facetElements, pathElements);

        // TODO Fix the API - it should only need one call
        var finalElements = sparql.ElementUtils.flatten(facetElements);
        finalElements = sparql.ElementUtils.flattenElements(finalElements);
        
        //var facetConcept = new ns.Concept(finalElements, propertyVar);
        var result = new Relation(finalElements, propertyVar, objectVar);
        return result;
    },

    /**
     * The returned relation holds a reference
     * to the facet and facet value variables.
     * 
     * Intended use is to first obtain the set of properties, then use this
     * method, and constrain the concept based on the obtained properties.
     * 
     * Examples:
     * - ({?p a rdf:Propery . ?s ?p ?o }, ?p, ?o })
     * - ({?s a ex:Foo . ?o ?p ?s }, ?p, ?o)
     *
     *
     * @param path
     * @param isInverse
     * @param properties {jassa.rdf.Node}
     * @param isNegated {boolean} True if the properties should be considered blacklisted
     */
    createRelationFacetValues: function(facetConfig, path, isInverse, properties, isNegated) {

        isInverse = !!isInverse; // ensure boolean

        var baseConcept = facetConfig.getBaseConcept();
        var rootFacetNode = facetConfig.getRootFacetNode(); 
        var constraintManager = facetConfig.getConstraintManager();

        var result;
        
        var propertyNames = properties.map(function(property) {
            return property.getUri();
        });

        var facetNode = rootFacetNode.forPath(path);

        // Set up the concept for fetching facets on constrained paths
        // However make sure to filter them by the user supplied array of properties
        var rawConstrainedSteps = constraintManager.getConstrainedSteps(path);

        var constrainedSteps = rawConstrainedSteps.filter(function(step) {
            var isSameDirection = step.isInverse() === isInverse;
            if(!isSameDirection) {
                return false;
            }

            var isContained = propertyNames.indexOf(step.getPropertyName()) >= 0;

            var result = isNegated ? !isContained : isContained;
            return result;
        });

        var excludePropertyNames = constrainedSteps.map(function(step) {
            return step.getPropertyName();
        });

        var includeProperties = [];
        var excludeProperties = [];
        
        properties.forEach(function(property) {
            if(excludePropertyNames.indexOf(property.getUri()) >= 0) {
                excludeProperties.push(property);
            }
            else {
                includeProperties.push(property);
            }
        });

        // The first part of the result is formed by conceptItems for the constrained steps
        var result = this.createConceptItems(facetNode, constrainedSteps);

        // Set up the concept for fetching facets of all concepts that were NOT constrained
        //var genericConcept = facetFacadeNode.createConcept(true);
        var genericRelation = this.createRelation(path, isInverse, false);
        var genericElements = genericRelation.getElements();
        
        // Combine this with the user specified array of properties
        var filterElement = ns.createFilter(genericRelation.getSourceVar(), includeProperties, false);
        if(filterElement != null) {
            genericElements.push(filterElement);
        }

        // Important: If there are no properties to include, we can drop the genericConcept
        if(includeProperties.length > 0) {
            var genericConceptItem = new ns.FacetConceptItem(null, genericRelation);

            result.push(genericConceptItem);
        }

        return result;
    },

    createStepRelations: function(facetConfig, path, constrainedSteps) {
        var self = this;

        var result = constrainedSteps.map(function(step) {
            var r = self.createConceptItem(facetConfig, path, step);
            return r;
        });

        return result;
    },

    createStepRelation: function(facetConfig, path, step) {
        var propertyName = step.getPropertyName();
        var property = rdf.NodeFactory.createUri(propertyName);

        var targetConcept = this.createRelationFacets(path, step.isInverse(), false, property);

        var result = new ns.FacetConceptItem(step, targetConcept);
        return result;
    },

};

module.exports = FacetConceptUtils;
