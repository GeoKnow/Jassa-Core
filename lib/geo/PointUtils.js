var PointUtils = {
    lonlatToWkt: function(lonlat) {
        var result = this.pointToWkt(lonlat.lon, lonlat.lat);
        return result;
    },

    xyToWkt: function(xy) {
        var result = this.pointToWkt(xy.x, xy.y);
        return result;
    },

    pointToWkt: function(x, y) {
        var result = 'POINT (' + x + ' ' + y + ')';
        return result;
    },

    wktPointRegex: /^\s*POINT\s*\(\s*([^\s]+)\s+([^)]+)\)\s*$/i,

    isWktPoint: function(wktStr) {
        var match = this.wktPointRegex.exec(wktStr);
        var result = !!match;
        return result;
    },

    wktToXy: function(wktStr) {
        var match = this.wktPointRegex.exec(wktStr);
        if(!match) {
            return null;
        }

        var xStr = match[1];
        var yStr = match[2];

        var result = {
            x: parseFloat(xStr),
            y: parseFloat(yStr)
        };

        return result;
    }
};

module.exports = PointUtils;
