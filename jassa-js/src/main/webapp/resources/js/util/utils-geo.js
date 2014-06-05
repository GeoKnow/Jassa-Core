(function() {

	var ns = Jassa.util.geo;
  var sparql = Jassa.sparql;

	/**
	 * @param varX The SPARQL variable that corresponds to the longitude
	 * @param varY The SPARQL variable that corresponds to the longitude
	 * @param bounds The bounding box to use for filtering
	 * @param castNode An optional SPAQRL node used for casting, e.g. xsd.xdouble
	 */
	ns.createWgsFilter = function(varX, varY, bounds, castNode) {
		var lon = new sparql.ExprVar(varX);
		var lat = new sparql.ExprVar(varY);
		
		// Cast the variables if requested
		if(castNode) {
      // FIXME: E_Cast not defined
			lon = new sparql.E_Cast(lon, castNode);
      // FIXME: E_Cast not defined
			lat = new sparql.E_Cast(lat, castNode);
		}

    // FIXME: forValue not defined
		var xMin = sparql.NodeValue.makeNode(sparql.Node.forValue(bounds.left));
    // FIXME: forValue not defined
		var xMax = sparql.NodeValue.makeNode(sparql.Node.forValue(bounds.right));
    // FIXME: forValue not defined
		var yMin = sparql.NodeValue.makeNode(sparql.Node.forValue(bounds.bottom));
    // FIXME: forValue not defined
		var yMax = sparql.NodeValue.makeNode(sparql.Node.forValue(bounds.top));

		var result = //new sparql.ElementFilter(
		  new sparql.E_LogicalAnd(
            new sparql.E_LogicalAnd(new sparql.E_GreaterThan(lon, xMin), new sparql.E_LessThan(lon, xMax)),
            new sparql.E_LogicalAnd(new sparql.E_GreaterThan(lat, yMin), new sparql.E_LessThan(lat, yMax))
		  );
		//);

		return result;		
	};
	
	
	ns.createFilterOgcIntersects = function(v, bounds) {
		var ogc = "http://www.opengis.net/rdf#";
		
		var exprVar = new sparql.ExprVar(v);
		var wktStr = ns.boundsToWkt(bounds);
		
		// FIXME: Better use typeLit with xsd:string
		var nodeValue = new sparql.NodeValue(sparql.NodeFactory.createPlainLiteral(wktStr));

		var result =
			new sparql.E_Function(
				ogc + "intersects",
				exprVar,
				new sparql.E_Function(
						ogc + "geomFromText",
						wktStr
				)
			);

		return result;
	};
	
	ns.boundsToWkt = function(bounds) {
		var ax = bounds.left;
		var ay = bounds.bottom;
		var bx = bounds.right;
		var by = bounds.top;
		
		var result = "POLYGON((" + ax + " " + ay + "," + bx + " " + ay
				+ "," + bx + " " + by + "," + ax + " " + by + "," + ax
				+ " " + ay + "))";

		return result;
	};

})();
