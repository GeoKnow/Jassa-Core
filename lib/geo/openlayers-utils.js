(function() {

    var ns = Jassa.geo.openlayers;
    var geo = Jassa.geo;

    /**
     * MapUtils for a OpenLayers map
     * 
     */
    ns.MapUtils = {
        getExtent: function(map) {
            var olRawExtent = map.getExtent();
            var e = olRawExtent.transform(map.projection, map.displayProjection);

            var result = new geo.Bounds(e.left, e.bottom, e.right, e.top);
            
            return result;
        }                  
    };

})();
