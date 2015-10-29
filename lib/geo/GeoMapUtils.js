var VarUtils = require('../sparql/VarUtils');
var NodeFactory = require('../rdf/NodeFactory');
var Concept = require('../sparql/Concept');
var GeoConceptUtils = require('./GeoConceptUtils');

//var TemplateParser = require('../sponate/TemplateParser');
var SponateUtils = require('../sponate/SponateUtils');


var GeoMapUtils = {
    createXyView: function(xyConcept, vx, vy) {
        vx = vx || VarUtils.x;
        vy = vy || VarUtils.y;

        var result = SponateUtils.parseSpec({
            name: 'lonlat',
            template: [{
                id: xyConcept.getVar(), // TODO Get rid of the '' + //'?s',
                lon: '' + vx,
                lat: '' + vy,
                wkt: ['' + vx, '' + vy, function(x, y) {
                    var r = 'POINT(' + x + ' ' + y + ')';
                    return r;
                }]
            }],
            from: xyConcept.getElement()
        });

        return result;
    },

    //wgs84GeoView: GeoMapUtils.createXyView(GeoConceptUtils.conceptWgs84),
    //schemaOrgGeoCoordinateView: GeoMapUtils.createXyView(GeoConceptUtils.conceptSchemaOrgGeoCoordinate),

    // Note: String attributes become JSON values; variables become RDF values

    wgs84GeoView: SponateUtils.parseSpec({
        name: 'lonlat',
        template: [{
            id: GeoConceptUtils.conceptWgs84.getVar(), // TODO Get rid of the '' + //'?s',
            lon: '' + VarUtils.x,
            lat: '' + VarUtils.y,
            wkt: ['' + VarUtils.x, '' + VarUtils.y, function(x, y) {
                var result = 'POINT(' + x + ' ' + y + ')';
                //var result = NodeFactory.createTypedLiteralFromString('POINT(' + x + ' ' + y + ')', 'http://www.opengis.net/ont/geosparql#wktLiteral');
                //var result = NodeFactory.createTypedLiteralFromString('POINT(' + b.get(VarUtils.x).getLiteralValue() + ' ' + b.get(VarUtils.y).getLiteralValue() + ')', 'http://www.opengis.net/ont/geosparql#wktLiteral');
                return result;
            }]
        }],
        from: GeoConceptUtils.conceptWgs84.getElement()
    }),

    ogcGeoView: SponateUtils.parseSpec({
        name: 'lonlat',
        template: [{
            id: GeoConceptUtils.conceptGeoVocab.getVar(),
            wkt: '' + VarUtils.w
        }],
        from: GeoConceptUtils.conceptGeoVocab.getElement()
    })
};

module.exports = GeoMapUtils;

