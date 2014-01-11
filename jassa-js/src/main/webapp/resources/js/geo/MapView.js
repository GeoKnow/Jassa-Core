(function($, _) {

var widgets = Namespace("org.aksw.ssb.widgets");
var qtc = Namespace("org.aksw.ssb.collections.QuadTreeCache");

var geo = Namespace("org.aksw.ssb.vocabs.wgs84");
var collections = Namespace("org.aksw.ssb.collections");
var geovocab = Namespace("org.aksw.ssb.vocabs.geovocab");
var appvocab = Namespace("org.aksw.ssb.vocabs.appvocab");


(function(ns) {

	ns.createSubMap = function(obj, keys) {
		var result = {};

		for(var i = 0; i < keys.length; ++i) {
			var key = keys[i];
			var value = obj[key];
			result[key] = value;
		}

		return result;
	};
	
	ns.createMapDiff = function(a, b) {

		var aIds = _.keys(a);
		var bIds = _.keys(b);
		
		var addedIds = _.difference(aIds, bIds);
		var removedIds = _.difference(bIds, aIds);

		var added = ns.createSubMap(a, addedIds);
		var removed = ns.createSubMap(b, removedIds);

		var result = {
				added: added,
				removed: removed
		};

		return result;
	};
	
	/**
	 * Indexes geometries in the given datastore
	 * 
	 * NOTE Assumes that geometries only have a single lon/lat pair.
	 * If there are multiple ones, an arbitrary pair is chosen.
	 * If there is a lat but no long, or vice versa, the resource does not appear in the output
	 * 
	 * @returns
	 */
	ns.extractGeomsWgs84 = function(databank) {
		var rdf = $.rdf({databank: databank});
		
		var result = {};
		
		var geomToX = {};
		var geomToY = {};
		
		rdf.where("?geom " + geo.lon + " ?x .").each(function() {
			geomToX[this.geom.value] = this.x.value;
		});
		
		rdf.where("?geom " + geo.lat + " ?y").each(function() {
			geomToY[this.geom.value] = this.y.value;
		});
		
		for(var geom in geomToX) {
			if(geom in geomToY) {
				var point = new qt.Point(geomToX[geom], geomToY[geom]);
				result[geom] = point;
			}
		}
		
		return result;		
	};
	
    /**
     * Given bounds and a set of quat tree nodes, this method
     * Creates a map resource->geometry and also determines which resources are visible
     */
	ns.indexGeoms = function(nodes, bounds) {

		if(!nodes) {
			// FIXME undefined 'nodes' happens, if there was an empty set of geometries or
			// a query failed. this should be trapped at a different location than here
			console.log("No nodes to index, should not happen; using workaround");
			
			nodes = [];
		}

		//debugger;
		
		var globalGeomToPoint = {};
		var visibleGeoms = [];

		for(var i = 0; i < nodes.length; ++i) {
			var node = nodes[i];

			var nodeBounds = node.getBounds();
			
			var databank = node.data.graph;
			var geomToPoint = node.data.geomToPoint ? node.data.geomToPoint : ns.extractGeomsWgs84(databank);

			
			//console.debug("geomToPoint", geomToPoint);
			//console.debug("Databank for node ", i, databank);
			
			// Attach the info to the node, so we reuse it the next time
			node.data.geomToPoint = geomToPoint;
			
			_.extend(globalGeomToPoint, geomToPoint);

			var geoms = _.keys(geomToPoint);
		
		
			// If the node is completely in the bounds, we can skip the boundary check
			if(bounds.contains(nodeBounds)) {
			
				visibleGeoms.push.apply(visibleGeoms, geoms);
			
			} else if(bounds.isOverlap(nodeBounds)) {
		
				//for(var geom in geoms) {
				for(var j = 0; j < geoms.length; ++j) {
					var geom = geoms[j];
					var point = geomToPoint[geom];
				
					//console.log("point is: ", geomToPoint);
				
					if(bounds.containsPoint(point)) {
						visibleGeoms.push(geom);
					}
				}
			
			}
		}

		return {geomToPoint: globalGeomToPoint, visibleGeoms: visibleGeoms};
    };


	/**
	 * TODO/Note This data should be (also) part of the model I suppose
	 */
	ns.ViewState = function(nodes, bounds, visibleGeoms, visibleBoxes) {
		this.nodes = nodes;
		this.bounds = bounds; //null; //new qt.Bounds(-9999, -9998, -9999, -9998);
		this.visibleGeoms = visibleGeoms ? visibleGeoms : [];
		
		this.visibleBoxes = visibleBoxes ? visibleBoxes : {};
	};

	
	
	ns.DynamicMapModel = Backbone.Model.extend({
		defaults: {
			sparqlService: null,
			geoConstraintFactory: null,
			viewState: null
		}
	});
	
	
	/**
	 * A controller that based on a query and a view port determines what data to fetch
	 *  
	 * 
	 */
	ns.DynamicMapController = function(model) {
		this.model = model;
		
		// TODO This is somewhat hacky: (a) use a proper cache object, (b) there must be one cache per sparqlService.
		this.hashToCache = {};
		
		this.bindAll();
	};
	
	ns.DynamicMapController.prototype = {
	
		bindAll: function() {
			var model = this.model;
			
			model.on('change:sparqlService change:geoConceptFactory change:bounds', this.refresh, this);
		},
		
		refresh: function() {
			var self = this;
			var task = this.computeDelta();
			
			task.then(function(state) {
				self.model.set({
					state: state
				});
			});
		},

		/**
		 * Updates the "resource" and "boxes" field of the model
		 * 
		 */
		computeDelta: function() {
			
			var result = $.Deferred();
			
			var model = this.model;
			
			var self = this;

			// The bounds of the model are open layers, but
			// we need to convert them to quad-tree-bounds here
			var olBounds = model.get('bounds');
			var sparqlService = model.get('sparqlService');
			var geoConceptFactory = model.get('geoConceptFactory');
			var geomPosFetcher = model.get('geomPosFetcher');
			
			if(!(olBounds && sparqlService && geoConceptFactory && geomPosFetcher)) {
				//**console.log('[WARN] Prerequisites for the MapView not met.');
				result.fail();
				return result;
			}
			
			var bounds = toQuadTreeBounds(olBounds);

			
			
			//console.log("Refresh bounds", bounds);

			
			
			var globalItemData = model.get('globalItemData');
			
			var promise = this.fetchNodesGeo(sparqlService, geomPosFetcher, geoConceptFactory, bounds);
			
			
			if(!promise) {
				console.log("[WARN] Another update of the geo data was running.");
				result.fail();
				return result;
			}
			
			//console.log("Promise is: ", promise);
						

			// TODO We could use pipe here
			promise.done(function(nodes) {
				
				// TODO Properly check if an old request is running
				// and schedule the next request
				if(!nodes) {
					console.log("Skipping refresh because an update is in progress");
					return;
				}
			
				var oldViewState = self.model.get('viewState');
				if(!oldViewState) {
					oldViewState = new ns.ViewState();
				}

				
				var newViewState = new ns.ViewState(nodes, bounds);
				
				//console.log("[TRACE] Loaded " + nodes.length + " nodes");
				//console.log("[TRACE] Nodes are:", nodes);
				var delta = self.updateViews(oldViewState, newViewState);
				
				data = {
						oldState: oldViewState,
						newState: newViewState,
						delta: delta,
						globalItemData: globalItemData
				};
				
				self.model.set({viewState: newViewState});

				result.resolve(data);
				
			}).fail(function() {
				result.fail();
			});
			
			return result;
		},
		
		
		
		/**
		 * This function bridges to the quad tree cache
		 */
		fetchNodesGeo: function(sparqlService, geomPosFetcher, geoConceptFactory, bounds) {
	        // TODO Make this configurable
			var quadTreeConfig = {
                    maxTileItemCount: 150,
                    maxGlobalItemCount: 750
	        };

			//var promise = fetchNodesGeo(queryGeneratorGeo, olBounds);
						
			//alert("Bounds are: " + JSON.stringify(bounds));
			
			// TODO The geoConstraintFactory can create elements, but it does not create a concept yet
			var geoConcept = geoConceptFactory.createConcept(null);
			
			var serviceHash = sparqlService.getStateHash();			
			var conceptHash = geoConcept.getElement().toString();

			
			var hash = serviceHash + conceptHash; 
			
			//console.log("[DEBUG] Query hash (including facets): " + hash);

			
			var cacheEntry = this.hashToCache[hash];
			if(!cacheEntry) {
				var backendFactory = new qtc.BackendFactory(sparqlService, geoConceptFactory);
				cacheEntry = new qtc.QuadTreeCache(backendFactory, geomPosFetcher, quadTreeConfig);
				//cacheEntry = new qt.QuadTree(maxBounds, 18, 0);
				this.hashToCache[hash] = cacheEntry;
			}
			
			var result = cacheEntry.load(bounds);
			return result;
		},
		
		
		updateViews: function(oldViewState, viewState) {
			
			var nodes = viewState.nodes;
			var bounds = viewState.bounds;

			var oldVisibleGeoms = oldViewState.visibleGeoms;
			
			//this.viewState = newState;
			
			var nodeIndex = ns.indexGeoms(nodes, bounds);
			var globalGeomToPoint = nodeIndex.geomToPoint;
			var visibleGeoms = nodeIndex.visibleGeoms;
			
			viewState.visibleGeoms = visibleGeoms;
			viewState.geomToPoint = globalGeomToPoint;
			

			/*
			 * Load:
			 * 1) relations between geometries and features
			 * 2) labels of the features 
			 */
			var geomToFeatures = collections.BidiMultiMap.createWithSet();
			var geomToFeatureCount = {};
			
			var idToLabel = {}; // TODO I don't think there is much point in having the labels here already; they should be fetched separately using the LabelFetcher
			for(var i = 0; i < nodes.length; ++i) {
				var node = nodes[i];

				if(!node.isLoaded) {
					continue;
				}

				var databank = node.data.graph;
				var rdf = $.rdf({databank: databank});
				
				rdf.where("?id " + geovocab.geometry + " ?geom").each(function() {
					//console.log("entry", this.geom, this.id);
					geomToFeatures.put(this.geom.value, this.id.value);
				});

				rdf.where("?geom " + appvocab.featureCount + " ?featureCount").each(function() {
					
					//geomToFeatureCount.put(this.geom.value, this.featureCount.value);
					geomToFeatureCount[this.geom.value] = this.featureCount.value;
				});


				rdf.where("?id " + rdfs.label + " ?label").each(function() {
					idToLabel[this.id.value] = this.label.value;
				});			
			}
			
			//console.debug("View refresh status", geomToFeatureCount, idToLabel);
			//console.debug("Visible geoms", visibleGeoms);
			//console.log("idToLabel", idToLabel);
			
			// TODO Separate the following part into a new method
			// (First part does the data fetching/preparation,
			// second part applies it)
			
			
			var addedGeoms    = _.difference(visibleGeoms, oldVisibleGeoms);
			var removedGeoms  = _.difference(oldVisibleGeoms, visibleGeoms);
			
			var addedBoxes = [];
			var removedBoxes = [];

			
			var visibleBoxes = {};
			var oldVisibleBoxes = oldViewState.visibleBoxes; 

			
			// If true, shows the box of each node
			var alwaysShowBoxes = false;
			
			for(var i = 0; i < nodes.length; ++i) {
				var node = nodes[i];
				
				if(!node.isLoaded || alwaysShowBoxes) {
					
					//console.log("adding a box for", node);
					var box = {
						id: node.getBounds().toString(),
						bounds: node.getBounds()
					};
					
					//addedBoxes.push(box);
					visibleBoxes[box.id] = box;
					//this.addBox(node.getBounds().toString(), toOpenLayersBounds(node.getBounds()));
				}
			}
			
			
			viewState.visibleBoxes = visibleBoxes;

			var boxDiff = ns.createMapDiff(visibleBoxes, oldVisibleBoxes);
			
			
			//this.geomToId.clear();
			//this.geomToId.addMultiMap(geomToId);

			//console.debug("Number of visible geoms", visibleGeoms.length);

			//console.log("label:", this.nodeToLabel);
			// HACK Find a better way to deal with the instances
			viewState.geomToFeatures = geomToFeatures;

			// TODO: idToLabel should be the replaced by a LabelFetcher
			//viewState.idToLabel = idToLabel;
			
			
			
			//this.setVisibleInstances(visibleGeoms, geomToFeatureCount, globalGeomToPoint);
			
			
			//this.setInstances(visibleGeoms, geomToFeatures, idToLabel);
			
			
			
			/*
			for(id in idToLabel) {
				var label = idToLabel[id];
				this.nodeToLabel.put(id, label);
			}
			*/

			// TODO HACK If nothing is selected, update the instance list
			/*
			if(!this.selectedFeature) {
				this.instanceWidget.refresh();
			}
			*/

			//this.updateInstanceList(visibleGeoms, geomToFeatureCount);
			
			
			//var visibleGeomNodes = visibleGeoms.map(function(x) { return sparql.Node.parse(x); });
			/*
			var visibleGeomNodes = _.map(visibleGeoms, function(x) { return sparql.Node.uri(x); });
			
			
			
			// HACK for testing the browser with Sparqlify
			var facetsEnabled = true;
			
			if(facetsEnabled) {
				this.updateFacetCountsGeom(visibleGeomNodes);
			}
			*/
			
			
			var result = {
					boxes: {
						added: boxDiff.added,
						removed: boxDiff.removed
					},
					items: {
						added: addedGeoms,
						removed: removedGeoms
					}
			};

			//console.log("old/new", oldViewState, viewState);

			return result;			
		}

	};
	
	
	
	
		
		
	ns.MapView = Backbone.View.extend({
	    tagName: 'div',
	    attributes: {style: 'float: left'},
	    events: { 
//	      'click span.swap':  'swap',
//	      'click span.delete': 'remove'
	    },    
	    initialize: function() {
	      _.bindAll(this, 'render', 'unrender', 'remove'); // every function that uses 'this' as the current object should be in here

	      var model = this.model;
	      //model.on('change:uris change:json', this.updateView, this);
	      
	      
	      model.on('change:center change:zoom', this.updateCenter, this);
	      
	      var items = model.get('items');
	      items.on('add', this.addItem, this);
	      items.on('remove', this.removeItem, this);
	      items.on('reset', this.resetItems, this);
	      items.on('change', this.updateItem, this);
	      
	      
	      //console.log("models are ", model);
	      var boxes = model.get('boxes');
	      boxes.on('add', this.addBox, this);
	      boxes.on('remove', this.removeBox, this);
	      boxes.on('reset', this.resetBoxes, this);

	      
	      //var itemCollection = this.model.get("resources");
	      // TODO Add support for updates when modifying the resource data
	      //var graphModel = this.model.get("resources");
	      
	      //itemCollection.on('add', this.addItem, this);
	      //itemCollection.on('remove', this.removeItem, this);
	    },
	    
	    updateCenter: function(model) {
	    	
	    	var map = this.getMap();
	    	
	    	var center = model.get('center');
	    	var zoom = model.get('zoom');

			center = center ? center : map.getCenter().transform(map.projection, map.displayProjection);
			zoom = zoom ? zoom : map.getZoom();

	    	
	    	var tmp = new OpenLayers.LonLat(center.lon, center.lat);
	    	var lonlat = tmp.transform(map.displayProjection, map.projection);
	    	
	    	
	    	//console.log('[DEBUG] Map state', center, zoom, lonlat);

			map.setCenter(lonlat, zoom, false, false);
	    },

	    getBasicState: function() {	    	
	    	var map = this.getMap();
	    	
	    	var tmp = map.getCenter();
	    	var lonlat = tmp.transform(map.projection, map.displayProjection);

	    	var zoom = map.getZoom();
	    	
	    	var result = {
	    		center: {lon: lonlat.lon, lat: lonlat.lat},
	    		zoom: zoom
	    	};
	    	
	    	return result;
	    },
	    
	    addItem: function(model) {
	    	
	    	// lets assume there are long and lot fields...
	    	var id = model.id;
	    	var geom = model.get('geom');
	    	var lonlat = geom;
//	    	var lon = geom.lon;
//	    	var lat = geom.lat;
	    	
	    	/*
			var lon = lons[0];
			var lat = lats[0];
			*/
//			var lonlat = new OpenLayers.LonLat(lon, lat);

	    	
			this.legacyWidget.addItem(id, geom, model.attributes, true);
	    },

	    removeItem: function(model) {
	    	var id = model.id;
	    	
	    	//console.log("Remove item: ", id);
	    	
	    	this.legacyWidget.removeItem(id);	    	
	    },
	    
	    
	    
	    addBox: function(model) {
	    	var id = model.id;
	    	var bounds = model.get('bounds');
	    	
	    	this.legacyWidget.addBox(id, bounds);
	    },

	    removeBox: function(model) {
	    	var id = model.id;
	    	
	    	this.legacyWidget.removeBox(id);
	    },
	    
	    resetBoxes: function(collection) {
	    	// TODO Not implemented yet
	    },

	    
	    render: function() {

	    	// Create the old map widget (this call returns a domElement)
	      this.$el.ssbMap();
	      
	      // Get the actual widget (not the domElement, but the object)
	      this.legacyWidget = this.$el.data("custom-ssbMap");
	      
	      // Extract the map
	      this.map = this.legacyWidget.map;
	      var self = this;
	      
			this.map.events.register("moveend", this, function(event) {
				self.trigger("mapevent", event, {"map": self.map});
			});
			
			this.map.events.register("zoomend", this, function(event) {
				self.trigger("mapevent", event, {"map": self.map});
			});
			
			$(this.el).on("ssbmapfeatureselect", function(ev, data) {
				var id = data.id;
				var items = self.model.get('items');				
				var model = items.get(id);
				
				
				self.trigger("featureSelect", ev, model);
			});

			$(this.el).on("ssbmapfeatureunselect", function(ev, data) {
				var id = data.id;
				var items = self.model.get('items');				
				var model = items.get(id);
				
				if(!model) {
					console.log('[WARN] Event canceled: Got unselection event of feature, but no data associated with it.')
					return;
				}

				self.trigger("featureUnselect", ev, model);
			});
			    
	      return this;
	    },
	    unrender: function() {
	      $(this.el).remove();
	    },
	    
	    remove: function() {
	      this.model.destroy();
	    },
	    
	    getMap: function() {
	    	return this.legacyWidget.map;
	    },
	    
	    
	    getLegacyWidget: function() {
	    	return this.legacyWidget;
	    },
	    
	    zoomToFit: function() {
	    	var map = this.getMap();
	    	
	    	var layer = this.legacyWidget.getFeatureLayer();
	    	var dataExtent = layer.getDataExtent();
	    	
	    	var targetZoom = Math.max(0, map.getZoomForExtent(dataExtent) - 1);
	    	
	    	console.log("dataExtent, targetZoom: ", dataExtent, targetZoom);
	    	
	    	//console.log("Zoom method: ", map);
	    	
	    	map.zoomTo();
	    	map.panTo(dataExtent.getCenterLonLat());
	    	//map.zoomToMaxExtent(dataExtent, false);
	    	//map.zoomToExtent(dataExtent, true);
	    },
	    
	    
	    updateViewNotUsedAnymore: function(model) {
	    	var self = this;
	    	
	    	var oldUris = model.previous("uris");
	    	var newUris = model.get("uris");
	    	
	    	var addedUris = _.difference(newUris, oldUris);
	    	var removedUris = _.difference(oldUris, newUris);
			//console.log("[MapView::updateView@addedUris]", addedUris);
			//console.log("[MapView::updateView@removedUris]", removedUris);
	    	
			//debugger;
			
	    	var json = model.get("json");
	    	var rdfGraph = new RdfGraph(json);
	    	
	    	self.legacyWidget.removeItems(removedUris);
	    	
	    	// For all addedUris, extract the geometric information
	    	for(var i = 0; i < addedUris.length; ++i) {
	    		var uri = addedUris[i];
	    		
	    		var lons = rdfGraph.getFloats(uri, "http://www.w3.org/2003/01/geo/wgs84_pos#long");
	    		var lats = rdfGraph.getFloats(uri, "http://www.w3.org/2003/01/geo/wgs84_pos#lat");
	    		
	    		
	    		//var tmp = json[uri];
	    		var jsonClone = _.clone(json);

	    		var attributes = {
	    				id: uri,
	    				json: jsonClone
	    		}
	    		
	    		var labels = rdfGraph.getStrings(uri, "http://www.w3.org/2000/01/rdf-schema#label", ["en", "de", ""]);
	    		if(labels.length > 0) {
	    			attributes["label"] = labels[0];
	    		} else {
	    			attributes["label"] = "";
	    		}
	    		
	    			
	    		if(lats.length == 1 && lons.length == 1) {
	    			var lon = lons[0];
	    			var lat = lats[0];
	    			
	    			var lonlat = new OpenLayers.LonLat(lon, lat);
	    			
	    			//console.log("Created marker at ", lon, lat, uri);
	    			self.legacyWidget.addItem(uri, lonlat, attributes, true);
	    		}
	    	}
	    }
	});
	
})(widgets);
})(jQuery, _);




/**
 * Combines the base concept with an "unbound" concept from the geoConceptFactory...
 * It is confusing that we now have 2 geo concept factories...
 * 
 */
//createGeoConceptFactory: function() {
//	var model = this.model;
//	
//	var concept = model.get('concept');
//	var geoConceptFactory = model.get('geoConceptFactory');
//	
//	
//	/*
//	//var geoPath = model.get('geoPath');
//	//var rootFacetNode = model.get('rootFacetNode');
//	
//	// TODO: I guess the geoConstraintFactory should encapsulate the geoPath and rootFacetNode
//	// And it should return a concept rather than an element
//	//var geoConstraintFactory = facets.ConstraintWgs84.Factory.create(geoPath);				
//	//var geoElements = geoConstraintFactory.createConstraint(null).createElements(rootFacetNode);				
//	
//	var geoConcept = geoConceptFactory.createConcept(null); // No bounds
//	//var geoElements = geoConcept.getElements();
//	//var tmpGeoConcept = new facets.ConceptInt(new sparql.ElementGroup(geoElements, concept.getVar());
//
//	var result = facets.createCombinedConcept(concept, geoConcept);
//
//	return result;
//	*/
//},		


/*
// Get all geometries from the databanks
for(var i = 0; i < nodes.length; ++i) {
	var node = nodes[i];
	var nodeBounds = node.getBounds();
	
	var databank = node.data.graph;
	var geomToPoint = node.data.geomToPoint ? node.data.geomToPoint : ns.extractGeomsWgs84(databank);

	
	//console.debug("geomToPoint", geomToPoint);
	//console.debug("Databank for node ", i, databank);
	
	// Attach the info to the node, so we reuse it the next time
	node.data.geomToPoint = geomToPoint;
	
	_.extend(globalGeomToPoint, geomToPoint);
	
	var geoms = _.keys(geomToPoint);
	
	
	// If the node is completely in the bounds, we can skip the boundary check
	if(bounds.contains(nodeBounds)) {
		
		visibleGeoms.push.apply(visibleGeoms, geoms);
		
	} else if(bounds.isOverlap(nodeBounds)) {
	
		//for(var geom in geoms) {
		for(var j = 0; j < geoms.length; ++j) {
			var geom = geoms[j];
			var point = geomToPoint[geom];
			
			//console.log("point is: ", geomToPoint);
			
			if(bounds.containsPoint(point)) {
				visibleGeoms.push(geom);
			}
		}
		
	}
}
*/

//console.debug("Number of visible geoms", visibleGeoms.length);

// Combine the datastores
//for(var i = 0; i < nodes.length; ++i) {
//	var node = nodes[i];
//	
//	var databank = node.data.graph;
//
//	// TODO Rather adding the datastore directly
//	// invoke a method that activates the node in the cache
//	this.multiGraph.addDatabank(databank);
//}		


/*
 * Updates of views below
 * 
 */
//var useOldMethod = false;
//if(useOldMethod) {
//
//	this.mapWidget.removeItems(removedGeoms);
///*
//for(var i = 0; i < removedGeoms.length; ++i) {
//	//var geom = removedGeoms[i];
//	
//	
//}*/
//		
//
//	for(var i = 0; i < addedGeoms.length; ++i) {
//		var geom = addedGeoms[i];
//
//		var point = globalGeomToPoint[geom];
//		var lonlat = new OpenLayers.LonLat(point.x, point.y);
//		
//		//console.debug("Adding map item", geom, point, lonlat);
//		this.mapWidget.addItem(geom, lonlat, true);
//	}
//}
