var Node = require('../rdf/node');
var ExprVar = require('../sparql/expr/expr-var');
var E_Cast = require('../sparql/e/e-cast');
var E_LogicalAnd = require('../sparql/e/e-logical-and');
var E_LessThan = require('../sparql/e/e-less-than');
var E_GreaterThan = require('../sparql/e/e-greater-than');
var NodeValue = require('../sparql/node-value');

/**
 * @param varX The SPARQL variable that corresponds to the longitude
 * @param varY The SPARQL variable that corresponds to the longitude
 * @param bounds The bounding box to use for filtering
 * @param castNode An optional SPAQRL node used for casting, e.g. xsd.xdouble
 */
var createWgsFilter = function(varX, varY, bounds, castNode) {
    var lon = new ExprVar(varX);
    var lat = new ExprVar(varY);

    // Cast the variables if requested
    if (castNode) {
        // FIXME: E_Cast not defined
        lon = new E_Cast(lon, castNode);
        // FIXME: E_Cast not defined
        lat = new E_Cast(lat, castNode);
    }

    // FIXME: forValue not defined
    var xMin = NodeValue.makeNode(Node.forValue(bounds.left));
    // FIXME: forValue not defined
    var xMax = NodeValue.makeNode(Node.forValue(bounds.right));
    // FIXME: forValue not defined
    var yMin = NodeValue.makeNode(Node.forValue(bounds.bottom));
    // FIXME: forValue not defined
    var yMax = NodeValue.makeNode(Node.forValue(bounds.top));

    var result = new E_LogicalAnd(
        new E_LogicalAnd(new E_GreaterThan(lon, xMin), new E_LessThan(lon, xMax)),
        new E_LogicalAnd(new E_GreaterThan(lat, yMin), new E_LessThan(lat, yMax))
    );

    return result;
};

module.exports = createWgsFilter;