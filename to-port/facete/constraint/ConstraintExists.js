
    ns.ConstraintExists = Class.create(ns.ConstraintBasePath, {
        classLabel: 'jassa.facete.ConstraintExists',

        initialize: function($super, path) {
            $super('exists', path);
        },
        
        createElementsAndExprs: function(facetNode) {
            var result = ns.ConstraintUtils.createConstraintExists(facetNode, this.path);
            return result;
        }
    });
