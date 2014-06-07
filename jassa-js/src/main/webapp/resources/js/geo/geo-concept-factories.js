(function() {

    var ns = Jassa.geo;
    
    /**
     * A concept with attributes
     * TODO Actually this is veeeery similar to what sponate does... This should be unified before things are developed twice
     * The difference is, that Sponate handles aggregation
     * 
     * varMap: Maps sparql variables to custom names
     * e.g. varMap.put('longitude', rdf.NodeFactory.createVar('x'));
     * 
     * 
     */
    ns.AttrConcept = Class.create({
        initialize: function(concept, varMap) {
            this.concept = concept;
            this.varMap = varMap;
        }
    });
    
    ns.BBoxConceptFactory = Class.create({
        createConcept: function(bounds) {
            throw 'Not overridden';
        }
    });
    
    
    ns.BBoxConceptFactoryImpl = Class.create({
        initialize: function(attrGeoConcept, bboxExprFactory) {
            this.attrGeoConcept = attrGeoConcept;
            this.bboxExprFactory = bboxExprFactory;
            
            //this.attrGeoConcept.getAttrVar('long');
            //this.attrGeoConcept.getAttrVar('lat');
            
        },
        
        createConcept: function(bounds) {
            var expr = this.bboxExprFactory.createExpr(bounds);
            
            //var baseConcept = this.attrGeoConcept.createConcept();
        }
    });
    
    
})();
