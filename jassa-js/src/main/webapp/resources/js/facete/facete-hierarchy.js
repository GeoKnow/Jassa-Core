(function() {
    
    /*
     * The goal is to create a module that can deal with arbitrary hierarchical
     * data:
     * 
     * Administrative Areas (continent -> country -> state -> city) 
     * rdfs:subClassOf
     * 
     * The format should be identical to that of the facet tree, so we can reuse the component as-is.
     * 
     * 
     * So we can distinguish between different types of hierarchies:
     * - Those based on a single relation regardless of depth (i.e. rdfs:subClassOf)
     * - Those where the parent child relation is based on the path.
     * 
     * 
     * The question is to what extend resource-paths and property-paths can be unified.
     * property-path-steps may be sparql 1.1 property paths.
     * 
     * 
     */
    
    var ns = Jassa.facete;
    
    
    ns.BinaryRelation = Class.create({
       initialize: function(element, parentVar, childVar) {
           this.element = element;
           this.parentVar = parentVar;
           this.childVar = childVar;
       },
       
       getElement: function() {
           return this.element;
       },
       
       getParentVar: function() {
           return this.parentVar;
       },
       
       getChildVar: function() {
           return this.childVar;
       }
    });
    
    
    ns.HierarchyQueryGenerator = Class.create({
        initialize: function(concept, binaryRelation) {
            
        }
    });
    
    ns.HierarchyService = Class.create({
        
    });
    
})();
