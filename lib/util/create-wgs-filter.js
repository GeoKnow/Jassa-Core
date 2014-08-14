var Node = require('../rdf/Node');
var ExprVar = require('../sparql/expr/ExprVar');
var ECast = require('../sparql/e/e-cast');
var ELogicalAnd = require('../sparql/e/e-logical-and');
var ELessThan = require('../sparql/e/e-less-than');
var EGreaterThan = require('../sparql/e/e-greater-than');
var NodeValue = require('../sparql/NodeValue');

/**
 * @param {Object} varX The SPARQL variable that corresponds to the longitude
 * @param {Object} varY The SPARQL variable that corresponds to the longitude
 * @param {Object} bounds The bounding box to use for filtering
 * @param {Object} castNode An optional SPAQRL node used for casting, e.g. xsd.xdouble
 */
var createWgsFilter = function(varX, varY, bounds, castNode) {
    var lon = new ExprVar(varX);
    var lat = new ExprVar(varY);

    // Cast the variables if requested
    if (castNode) {
        // FIXME: ECast not defined
        lon = new ECast(lon, castNode);
        // FIXME: ECast not defined
        lat = new ECast(lat, castNode);
    }

    // FIXME: forValue not defined
    var xMin = NodeValue.makeNode(Node.forValue(bounds.left));
    // FIXME: forValue not defined
    var xMax = NodeValue.makeNode(Node.forValue(bounds.right));
    // FIXME: forValue not defined
    var yMin = NodeValue.makeNode(Node.forValue(bounds.bottom));
    // FIXME: forValue not defined
    var yMax = NodeValue.makeNode(Node.forValue(bounds.top));

    var result = new ELogicalAnd(
        new ELogicalAnd(new EGreaterThan(lon, xMin), new ELessThan(lon, xMax)),
        new ELogicalAnd(new EGreaterThan(lat, yMin), new ELessThan(lat, yMax))
    );

    return result;
};

module.exports = createWgsFilter;
