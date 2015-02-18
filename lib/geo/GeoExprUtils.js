var NodeValueUtils = require('../sparql/NodeValueUtils');
var ExprVar = require('../sparql/expr/ExprVar');
var E_Cast = require('../sparql/expr/E_Cast');
var NodeValue = require('../sparql/expr/NodeValue');
var E_LogicalAnd = require('../sparql/expr/E_LogicalAnd');
var E_Function = require('../sparql/expr/E_Function');
var E_GreaterThan = require('../sparql/expr/E_GreaterThan');
var E_LessThan = require('../sparql/expr/E_LessThan');


var GeoExprUtils = {
    /**
     * @param varX The SPARQL variable that corresponds to the longitude
     * @param varY The SPARQL variable that corresponds to the longitude
     * @param bounds The bounding box to use for filtering
     * @param castNode An optional SPAQRL node used for casting, e.g. xsd.xdouble
     */
    createExprWgs84Intersects: function(varX, varY, bounds, castNode) {
        var lon = new ExprVar(varX);
        var lat = new ExprVar(varY);

        // Cast the variables if requested
        // Using E_Function(castNode.getUri(), lon) - i.e. the cast type equals the cast function name
        if(castNode) {
            var fnName = castNode.getUri();
            lon = new E_Function(fnName, [lon]);
            lat = new E_Function(fnName, [lat]);
        }

        var xMin = NodeValueUtils.makeDecimal(bounds.left);
        var xMax = NodeValueUtils.makeDecimal(bounds.right);
        var yMin = NodeValueUtils.makeDecimal(bounds.bottom);
        var yMax = NodeValueUtils.makeDecimal(bounds.top);

        var result = new E_LogicalAnd(
            new E_LogicalAnd(new E_GreaterThan(lon, xMin), new E_LessThan(lon, xMax)),
            new E_LogicalAnd(new E_GreaterThan(lat, yMin), new E_LessThan(lat, yMax))
        );

        return result;
    },


    createExprOgcIntersects: function(v, bounds, intersectsFnName, geomFromTextFnName) {
        var ogc = 'http://www.opengis.net/rdf#';

        intersectsFnName = intersectsFnName || (ogc + 'intersects');
        geomFromTextFnName = geomFromTextFnName || (ogc + 'geomFromText');


        var exprVar = new ExprVar(v);
        var wktStr = this.boundsToWkt(bounds);

        // FIXME: Better use typeLit with xsd:string
        var wktNodeValue = NodeValueUtils.makeString(wktStr); //new NodeValue(rdf.NodeFactory.createPlainLiteral(wktStr));

        var result = new E_Function(
                intersectsFnName,
            [exprVar, new E_Function(geomFromTextFnName, [wktNodeValue])]
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

        var result = 'POLYGON((' + ax + ' ' + ay + ',' + bx + ' ' + ay
                + ',' + bx + ' ' + by + ',' + ax + ' ' + by + ',' + ax
                + ' ' + ay + '))';

        return result;
    }
};

module.exports = GeoExprUtils;
