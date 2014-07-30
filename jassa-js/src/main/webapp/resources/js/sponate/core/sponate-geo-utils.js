(function() {

    var ns = Jassa.sponate;
    var sparql = Jassa.sparql;
    var sponate = Jassa.sponate;

    ns.GeoMapFactory = Class.create({
        classLabel: 'GeoMapFactory',
        
        initialize: function(baseSponateView, bboxExprFactory) {
            //this.template = template;
            //this.baseElement = baseElement;
            this.baseSponateView = baseSponateView;
            this.bboxExprFactory = bboxExprFactory;
        },

        createMap: function(bounds) {
            var result = this.createMapForBounds(bounds);
            return result;
        },
        
        // DEPRECATED - use createMap(null)
        createMapForGlobal: function() {
            var result = this.createMapForBounds(null);
            return result;
        },
        
        // DEPRECATED - use createMap(bounds)
        createMapForBounds: function(bounds) {
            var baseSponateView = this.baseSponateView;
            var bboxExprFactory = this.bboxExprFactory;
            
            var pattern = baseSponateView.getPattern();
            var baseElementFactory = baseSponateView.getElementFactory();
            
            var baseElement = baseElementFactory.createElement();
            var element = baseElement;         
            if(bounds) {
                var filterExpr = bboxExprFactory.createExpr(bounds);
                var filterElement = new sparql.ElementFilter(filterExpr);
               
                element = new sparql.ElementGroup([baseElement, filterElement]);
            }
               
            var result = new sponate.Mapping(null, pattern, new sparql.ElementFactoryConst(element));
            return result;
        }
    });
    
})();
