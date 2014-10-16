var VarUtils = require('../sparql/VarUtils');
var NodeFactory = require('../rdf/NodeFactory');
var Concept = require('../sparql/Concept');
var GeoConceptUtils = require('./GeoConceptUtils');

//var TemplateParser = require('../sponate/TemplateParser');
var SponateUtils = require('../sponate/SponateUtils');


var GeoMapUtils = {
    wgs84GeoView: SponateUtils.parseSpec({
        name: 'lonlat',
        template: [{
            id: '' + GeoConceptUtils.conceptWgs84.getVar(), // TODO Get rid of the '' + //'?s',
            lon: VarUtils.x,
            lat: VarUtils.y,
            wkt: [VarUtils.x, VarUtils.y, function(x, y) {
                var result = NodeFactory.createTypedLiteralFromString('POINT(' + x + ' ' + y + ')', 'http://www.opengis.net/ont/geosparql#wktLiteral');
                //var result = NodeFactory.createTypedLiteralFromString('POINT(' + b.get(VarUtils.x).getLiteralValue() + ' ' + b.get(VarUtils.y).getLiteralValue() + ')', 'http://www.opengis.net/ont/geosparql#wktLiteral');
                return result;
            }]
        }],
        from: GeoConceptUtils.conceptWgs84.getElement()
    }),

    ogcGeoView: SponateUtils.parseSpec({
        name: 'lonlat',
        template: [{
            id: '' + GeoConceptUtils.conceptGeoVocab.getVar(),
            wkt: VarUtils.w
        }],
        from: GeoConceptUtils.conceptGeoVocab.getElement()
    })
};

module.exports = GeoMapUtils;

