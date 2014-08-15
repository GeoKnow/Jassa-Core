var Node = require('../rdf/node/Node');
var ExprVar = require('../sparql/expr/ExprVar');
var NodeValue = require('../sparql/expr/NodeValue');
var E_LogicalAnd = require('../sparql/expr/E_LogicalAnd');
var E_LogicalOr = require('../sparql/expr/E_LogicalOr');
var E_Function = require('../sparql/expr/E_Function');
var E_Cast = require('../sparql/expr/E_Cast');
var E_GreaterThan = require('../sparql/expr/E_GreaterThan');
var E_LessThan = require('../sparql/expr/E_LessThan');

var GeoUtils = {
    boundsToWkt: function(bounds) {
        var ax = bounds.left;
        var ay = bounds.bottom;
        var bx = bounds.right;
        var by = bounds.top;

        var result = 'POLYGON((' + ax + ' ' + ay + ',' + bx + ' ' + ay +
            ',' + bx + ' ' + by + ',' + ax + ' ' + by + ',' + ax + ' ' + ay + '))';

        return result;
    },

    createFilterOgcIntersects: function(v, bounds) {
        var ogc = 'http://www.opengis.net/rdf#';

        var exprVar = new ExprVar(v);
        var wktStr = this.boundsToWkt(bounds);

        // FIXME: Better use typeLit with xsd:string
        // var nodeValue = new NodeValue(NodeFactory.createPlainLiteral(wktStr));

        var result =
            new E_Function(
                ogc + 'intersects',
                exprVar,
                new E_Function(
                    ogc + 'geomFromText',
                    wktStr
                )
            );

        return result;
    },
    
    createWgsFilter: function(varX, varY, bounds, castNode) {
        var lon = new ExprVar(varX);
        var lat = new ExprVar(varY);

        // Cast the variables if requested
        if (castNode) {
            // FIXME: ECast not defined
            lon = new E_Cast(lon, castNode);
            // FIXME: ECast not defined
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
    },

};

module.exports = GeoUtils;
