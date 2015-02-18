var BboxExprFactoryWkt = require('./BboxExprFactoryWkt');
var BboxExprFactoryWgs84 = require('./BboxExprFactoryWgs84');
var GeoMapUtils = require('./GeoMapUtils');
var GeoMapFactory = require('./GeoMapFactory');
var VarUtils = require('../sparql/VarUtils');
var Concept = require('../sparql/Concept');
var ElementTriplesBlock = require('../sparql/element/ElementTriplesBlock');
var NodeFactory = require('../rdf/NodeFactory');
var Triple = require('../rdf/Triple');

var rdf = require('../vocab/rdf');
var xsd = require('../vocab/xsd');

//var TemplateParser = require('../sponate/TemplateParser');
var SponateUtils = require('../sponate/SponateUtils');

var defaultIntersectsFnName = '<bif:st_intersects>';
var defaultGeomFromTextFnName = '<bif:st_geomFromText>';

//var mapParser = new TemplateParser();


var GeoMapFactoryUtils = {

    wgs84MapFactory: new GeoMapFactory(
            GeoMapUtils.wgs84GeoView,
            new BboxExprFactoryWgs84(VarUtils.x, VarUtils.y)
    ),

    /**
     * A geomap factory similar to the one above, however geo:lat / geo:long values in the data
     * are explicitly converted to decimals in order to account for standard conform string values
     */
    wgs84CastMapFactory: new GeoMapFactory(
            GeoMapUtils.wgs84GeoView,
            new BboxExprFactoryWgs84(VarUtils.x, VarUtils.y, xsd.xdouble)
    ),

    ogcVirtMapFactory: new GeoMapFactory(
            GeoMapUtils.ogcGeoView,
            new BboxExprFactoryWkt(VarUtils.w, defaultIntersectsFnName, defaultGeomFromTextFnName)
    ),

    // TODO Replace defaults with geosparql rather than virtuoso bifs
    createWktMapFactory: function(wktPredicateName, intersectsFnName, geomFromTextFnName) {
        wktPredicateName = wktPredicateName || 'http://www.opengis.net/ont/geosparql#asWKT';
        intersectsFnName = intersectsFnName || defaultIntersectsFnName;
        geomFromTextFnName = geomFromTextFnName || defaultGeomFromTextFnName;

        var predicate = NodeFactory.createUri(wktPredicateName);

        var geoConcept = new Concept(
            new ElementTriplesBlock([new Triple(VarUtils.s, predicate, VarUtils.w)]),
            VarUtils.s
        );


        var baseMap = SponateUtils.parseSpec({
            name: 'geoMap-' + wktPredicateName,
            template: [{
                id: '' + geoConcept.getVar(), // TODO get rid of the '' +
                wkt: '' + VarUtils.w
            }],
            from: geoConcept.getElement()
        });


        var result = new GeoMapFactory(
                baseMap,
                new BboxExprFactoryWkt(VarUtils.w, intersectsFnName, geomFromTextFnName)
        );

        return result;
    }
};

module.exports = GeoMapFactoryUtils;
