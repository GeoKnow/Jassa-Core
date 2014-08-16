    /**
     * ConstraintSpecs can be arbitrary objects, however they need to expose the
     * declared paths that they affect.
     * DeclaredPaths are the ones part of spec, affectedPaths are those after considering the constraint's sparql element. 
     * 
     */
    ns.Constraint = Class.create({
        getName: function() {
            console.log('[ERROR] Override me');         
            throw 'Override me';
        },
        
        getDeclaredPaths: function() {
            console.log('[ERROR] Override me');
            throw 'Override me';
        },
        
        createElementsAndExprs: function(facetNode) {
            console.log('[ERROR] Override me');
            throw 'Override me';            
        },
        
        equals: function() {
              console.log('[ERROR] Override me');
            throw 'Override me';
        },
        
        hashCode: function() {
            console.log('[ERROR] Override me');
            throw 'Override me';
        }
    });
    