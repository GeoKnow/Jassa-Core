(function() {

    var ns = Jassa.geo;
    
    
    ns.GeoExprUtils = {
        /**
         * @param varX The SPARQL variable that corresponds to the longitude
         * @param varY The SPARQL variable that corresponds to the longitude
         * @param bounds The bounding box to use for filtering
         * @param castNode An optional SPAQRL node used for casting, e.g. xsd.xdouble
         */
        createExprWgs84Intersects: function(varX, varY, bounds, castNode) {
            var lon = new sparql.ExprVar(varX);
            var lat = new sparql.ExprVar(varY);
            
            // Cast the variables if requested
            // TODO E_Cast should not be used - use E_Function(castNode.getUri(), lon) instead - i.e. the cast type equals the cast function name
            if(castNode) {
                lon = new sparql.E_Cast(lon, castNode);
                lat = new sparql.E_Cast(lat, castNode);
            }
            
            var xMin = sparql.NodeValue.makeDecimal(bounds.left);
            var xMax = sparql.NodeValue.makeDecimal(bounds.right);
            var yMin = sparql.NodeValue.makeDecimal(bounds.bottom);
            var yMax = sparql.NodeValue.makeDecimal(bounds.top);

            var result = new sparql.E_LogicalAnd(
                new sparql.E_LogicalAnd(new sparql.E_GreaterThan(lon, xMin), new sparql.E_LessThan(lon, xMax)),
                new sparql.E_LogicalAnd(new sparql.E_GreaterThan(lat, yMin), new sparql.E_LessThan(lat, yMax))
            );

            return result;
        },
            
            
        createExprOgcIntersects: function(v, bounds, intersectsSparqlFnName) {
            var ogc = 'http://www.opengis.net/rdf#';
            
            if(!sparqlFnName) {
                sparqlFnName = ogc + 'intersects'
            }
            
            var exprVar = new sparql.ExprVar(v);
            var wktStr = this.boundsToWkt(bounds);
            
            // FIXME: Better use typeLit with xsd:string
            var nodeValue = new sparql.NodeValue(sparql.Node.plainLit(wktStr));
            
            var result = new sparql.E_Function(
                intersectsSparqlFnName,
                exprVar,
                new sparql.E_Function(ogc + "geomFromText", wktStr)
            );

            return result;
        },
         
        /**
         * Convert a bounds object to a WKT polygon string
         * 
         * TODO This method could be moved to a better place
         * 
         */
        boundsToWkt: function(bounds) {
            var ax = bounds.left;
            var ay = bounds.bottom;
            var bx = bounds.right;
            var by = bounds.top;
            
            var result = "POLYGON((" + ax + " " + ay + "," + bx + " " + ay
                    + "," + bx + " " + by + "," + ax + " " + by + "," + ax
                    + " " + ay + "))";

            return result;
        }   
    };

    
})();
