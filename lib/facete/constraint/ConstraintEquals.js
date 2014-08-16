
    ns.ConstraintEquals = Class.create(ns.ConstraintBasePathValue, {
        classLabel: 'jassa.facete.ConstraintEquals',
        
        initialize: function($super, path, node) {
            $super('equals', path, node);
        },
        
        createElementsAndExprs: function(facetNode) {
            var result = ns.ConstraintUtils.createConstraintEquals(facetNode, this.path, this.value);
            return result;
        }
    });
    