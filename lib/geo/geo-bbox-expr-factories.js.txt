(function() {

    var ns = Jassa.geo;
    
    ns.BBoxExprFactory = Class.create({
        createExpr: function(bounds) {
            throw 'Not implemented';
        }
    });
    

    ns.BBoxExprFactoryWgs84 = Class.create(ns.BBoxExprFactory, {
        initialize: function(xVar, yVar, castNode) {
            //this.geoVar = geoVar;
            this.xVar = xVar;
            this.yVar = yVar;
            this.castNode = castNode;
        },
        
        createExpr: function(bounds) {
            var result = ns.GeoExprUtils.createExprWgs84Intersects(this.xVar, this.yVar, bounds, this.castNode);
            return result;
        }
    });
    

    ns.BBoxExprFactoryWkt = Class.create(ns.BBoxExprFactory, {
        initialize: function(wktVar, intersectsFnName, geomFromTextFnName) {
            this.wktVar = wktVar;
            this.intersectsFnName = intersectsFnName;
            this.geomFromTextFnName = geomFromTextFnName;
        },
        
        createExpr: function(bounds) {
            var result = ns.GeoExprUtils.createExprOgcIntersects(this.wktVar,bounds, this.intersectsFnName, this.geomFromTextFnName);
            return result;
        }
    });
    
})();
