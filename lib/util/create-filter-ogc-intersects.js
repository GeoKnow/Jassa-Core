var ExprVar = require('../sparql/expr/expr-var');
var E_Function = require('../sparql/e/e-function');
var boundsToWkt = require('./bounds-to-wkt');

var createFilterOgcIntersects = function(v, bounds) {
    var ogc = 'http://www.opengis.net/rdf#';

    var exprVar = new ExprVar(v);
    var wktStr = boundsToWkt(bounds);

    // FIXME: Better use typeLit with xsd:string
    //var nodeValue = new NodeValue(NodeFactory.createPlainLiteral(wktStr));

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
};

module.exports = createFilterOgcIntersects;