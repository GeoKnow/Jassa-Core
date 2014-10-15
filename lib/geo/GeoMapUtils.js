var VarUtils = require('../sparql/VarUtils');
var NodeFactory = require('../rdf/NodeFactory');
var Concept = require('../sparql/Concept');
var GeoConceptUtils = require('./GeoConceptUtils');

var TemplateParser = require('../sponate/TemplateParser');

var mapParser = new TemplateParser();

var GeoMapUtils = {
    wgs84GeoView: mapParser.parseMap({
        name: 'lonlat',
        template: [{
            id: GeoConceptUtils.conceptWgs84.getVar(), //'?s',
            lon: VarUtils.x,
            lat: VarUtils.y,
            wkt: function(b) {
                var result = NodeFactory.createTypedLiteralFromString('POINT(' + b.get(VarUtils.x).getLiteralValue() + ' ' + b.get(VarUtils.y).getLiteralValue() + ')', 'http://www.opengis.net/ont/geosparql#wktLiteral');
                return result;
            }
        }],
        from: GeoConceptUtils.conceptWgs84.getElement()
    }),

    ogcGeoView: mapParser.parseMap({
        name: 'lonlat',
        template: [{
            id: GeoConceptUtils.conceptGeoVocab.getVar(),
            wkt: VarUtils.w
        }],
        from: GeoConceptUtils.conceptGeoVocab.getElement()
    })
};

module.exports = GeoMapUtils;

