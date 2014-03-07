(function() {

    var rdf = Jassa.rdf;
    var sparql = Jassa.sparql;
    var sponate = Jassa.sponate;
    var facete = Jassa.facete;
    
    var ns = Jassa.geo;

    var vs = rdf.NodeFactory.createVar('s');
    var vx = rdf.NodeFactory.createVar('x');
    var vy = rdf.NodeFactory.createVar('y');
    var vw = rdf.NodeFactory.createVar('w');

    
    ns.GeoConcepts = {
        conceptWgs84: new facete.Concept(sparql.ElementString.create('?s <http://www.w3.org/2003/01/geo/wgs84_pos#long> ?x ;  <http://www.w3.org/2003/01/geo/wgs84_pos#lat> ?y'), vs),
        
        conceptGeoVocab:  new facete.Concept(sparql.ElementString.create('?s <http://www.opengis.net/ont/geosparql#asWKT> ?w'), vs)
    };
    
    var mapParser = new sponate.MapParser();

    ns.GeoMapUtils = {
        wgs84GeoView: mapParser.parseMap({
            name: 'lonlat',
            template: [{
                id: ns.GeoConcepts.conceptWgs84.getVar(), //'?s',
                lon: vx, // '?x',
                lat: vy, // '?y'
                wkt: function(b) { return rdf.NodeFactory.createTypedLiteralFromString('POINT(' + b.get(vx).getLiteralValue() + ' ' + b.get(vy).getLiteralValue() + ')', 'http://www.opengis.net/ont/geosparql#wktLiteral'); }
            }],
            from: ns.GeoConcepts.conceptWgs84.getElement()
        }),

        ogcGeoView: mapParser.parseMap({
            name: 'lonlat',
            template: [{
                id: ns.GeoConcepts.conceptGeoVocab.getVar(),
                wkt: vw
            }],
            from: ns.GeoConcepts.conceptGeoVocab.getElement()
        })
    };

    var intersectsFnName = 'bif:st_intersects';
    var geomFromTextFnName = 'bif:st_geomFromText';

    ns.GeoMapFactoryUtils = {
    
        wgs84MapFactory: new sponate.GeoMapFactory(
                ns.GeoMapUtils.wgs84GeoView,
                new ns.BBoxExprFactoryWgs84(vx, vy)
        ),

        ogcVirtMapFactory: new sponate.GeoMapFactory(
                ns.GeoMapUtils.ogcGeoView,
                new ns.BBoxExprFactoryWkt(vw, intersectsFnName, geomFromTextFnName)
        )
    };

})();
