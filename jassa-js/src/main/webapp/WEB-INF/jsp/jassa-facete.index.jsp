<!DOCTYPE html>
<html ng-app="FaceteDBpediaExample">

<head>
	<meta content="text/html; charset=utf-8" http-equiv="Content-Type">
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />

	<title>Facete Example: DBpedia</title>
<!-- 	<link rel="stylesheet" href="resources/css/bootstrap-2.3.2-pagination.css" /> -->
<!-- 	<link rel="stylesheet" href="resources/libs/twitter-bootstrap/2.3.2/css/bootstrap.min.css" /> -->
	<link rel="stylesheet" href="resources/libs/twitter-bootstrap/3.0.1/css/bootstrap.min.css" />
	
	${cssIncludes}
	
	<style media="screen" type="text/css">
	.pagination {
	    margin-top: 5px;
	    margin-bottom: 5px;
	}
	
	.image {
 	    max-width: 144px;
 	    max-height: 144px;
	    vertical-align: middle;
	}
	
	.facet-row:hover {
	    background-color: #bbccff;
	}
	
	.highlite {
	    /*background-color: #ddeeff;*/
	    background-color: #ddddff;
	}
	
	input[type=text] .btn-xs, input[type=password] .btn-xs {
        height: 14px !important;
    }

	.portlet-frame {
		border: 1px;
		border-collapse: true;
		border-style: solid;
		border-color: #cccccc;
		padding-right: 0px;
		margin: 3px;
		padding: 3px;	
	}	
	
	.frame {
		border: 1px;
		border-collapse: true;
		border-style: solid;
		border-color: #cccccc;
		padding-right: 0px;
/* 		padding-bottom: 16px; */
 		margin-top: 3px;
 		margin-bottom: 3px;
/*  		background-color: #eeeeee; */
/* 		background-color: #EEEEEE; */
	}
	
	.portlet {
/* 		border: 1px; */
/* 		border-collapse: true; */
/* 		border-style: solid; */
/* 		border-color: #cccccc; */
/* 		padding-right: 0px; */
		padding: 5px;
/* 		padding-bottom: 16px; */
/*  		margin-top: 3px; */
 		margin: 5px;
/*  		margin-bottom: 3px; */
/*  		background-color: #EFEFEF; */
 		background-color: rgba(239, 239, 239, 0.7);
 		
/*  		background : url("resources/images/facete-ui/background.png") repeat scroll 0 0 rgba(0, 0, 0, 0); */
/*  		background-color: #eeeeee; */
/* 		background-color: #EEEEEE; */
	}


	a {
	    cursor: pointer
	}
	
	.image-frame {
		display: table;

	    width: 150px;
	    height: 150px;	
		line-height: 150px; /* should match height */
		text-align: center;
  
		border: 1px;
		border-collapse: true;
		border-style: solid;
		border-color: #CCCCCC;
		background-color: #EEEEEE;
	}
	
	.navbar-inner {
	    background-color: #CCCCFA;
        background-image: linear-gradient(to bottom, #CCCCFF, #EEEEFF);
    }
    
    .nav-tabs {
		background-color: #eeeeff;
    }
    
    .modal {
    	display: block;
    	height: 0;
    	overflow: visible;
    }
    
    .modal-header {
        background-color: #FFFFFF !important;
    }

    .modal-body {
        background-color: #FFFFFF !important;
    }
    
    .layout-table {
		width: 100%;
		min-height: 100%;
		border:none;
		border-collapse: collapse;
	}

	.layout-table > tbody > tr > td {
		padding: 0px;
		border-left: 5px solid #1c3048;
		border-right: 5px solid #1c3048;
		vertical-align: top;
	}
	
	.visible-on-hover {
	    visibility: hidden;
	}
	
	.visible-on-hover:hover {
	    visibility: visible;
	}
    
    
    /* Not working yet, as openlayers positions the element programmatically */
	.olControlPanZoomBar {
		right: 10px;
/* 		position: absolute; */
/* 		top: 10px; */
/* 		left: 10px; */
	}
	
	.inactive {
		color: #aaaaaa;
	}
	
	.tabset-small > .nav > li > a {
    	display: block;
    	padding: 3px 15px;
    	position: relative;
	}
	
	.pagination-tiny > li > a, .pagination-tiny > li > span {
    	font-size: 10px;
    	padding: 5px;
	}
	
	</style>
	
	<!--  TODO PrefixMapping Object von Jena portieren ~ 9 Dec 2013 -->
	
	<script src="resources/libs/jquery/1.9.1/jquery.js"></script>
	<script src="resources/libs/twitter-bootstrap/3.0.1/js/bootstrap.js"></script>
	
	<script src="resources/libs/underscore/1.5.2/underscore.js"></script>
	<script src="resources/libs/underscore.string/2.3.0/underscore.string.js"></script>
	<script src="resources/libs/prototype/1.7.1/prototype.js"></script>

<!-- 	<script src="resources/libs/angularjs/1.0.8/angular.js"></script> -->
<!-- 	<script src="resources/libs/angularjs/1.2.0-rc.2/angular.js"></script>	 -->
<!-- 	<script src="resources/libs/angularjs/1.2.0-rc.3/angular.js"></script> -->
	<script src="resources/libs/angularjs/1.2.10/angular.js"></script>
	
		
<!-- 	<script src="resources/libs/angular-ui/0.7.0/ui-bootstrap-tpls-0.7.0.js"></script> -->
	<script src="resources/libs/angular-ui/0.10.0/ui-bootstrap-tpls-0.10.0.js"></script>
	<script src="resources/libs/ui-router/0.2.0/angular-ui-router.js"></script>

	<script src="resources/libs/monsur-jscache/2013-12-02/cache.js"></script>

	${jsIncludes}


    <script type="text/javascript" src="resources/libs/jquery-ui/1.10.2/ui/jquery-ui.js"></script>

	<script src="resources/js/facete/facete-playground.js"></script>

    <script type="text/javascript" src="resources/libs/open-layers/2.12/OpenLayers.js"></script>

    <script type="text/javascript" src="resources/libs/open-layers/2.12/OpenLayers.js"></script>
    <script type="text/javascript" src="resources/js/geo/jquery.ssb.map.js"></script>
	
    <script type="text/javascript" src="resources/libs/JSONCanonical/JSONCanonical.js"></script>
	
    <script type="text/javascript" src="resources/libs/jassa-ui-angular/jassa-ui-angular.js"></script>
	
	
	<script type="text/javascript">
	_.mixin(_.str.exports());

	
	var prefLabelPropertyUris = [
   	    'http://www.w3.org/2000/01/rdf-schema#label'
    	//'http://geoknow.eu/geodata#name'
	];

	var prefLangs = ['de', 'en', ''];

	
	var prefixes = {
		'dbpedia-owl': 'http://dbpedia.org/ontology/',
		'dbpedia': 'http://.org/resource/',
		'rdfs': 'http://www.w3.org/2000/01/rdf-schema#',
		'foaf': 'http://xmlns.com/foaf/0.1/',
		'fp7o': 'http://fp7-pp.publicdata.eu/ontology/',
		'fp7r': 'http://fp7-pp.publicdata.eu/resource/'
	};

	var rdf = Jassa.rdf;
	var sparql = Jassa.sparql;
	var service = Jassa.service;
	var sponate = Jassa.sponate;
	var serv = Jassa.service;
	var util = Jassa.util;
	var client = Jassa.client;
	
	var geo = Jassa.geo;
	
	var facete = Jassa.facete;
	
	</script>
	
	<script src="resources/js/unsorted.js"></script>

	<script>
	
	
	var markerFillColors = ['#ff0000', '#0000ff', '00ff00'];
	var markerStrokeColors = ['#ff8080', '#8080ff', '80ff80'];

    var sparqlServiceIri = 'http://localhost/fts-sparql';
    //var sparqlServiceIri = 'http://dbpedia.org/sparql';
 	//var defaultGraphIris = ['http://dbpedia.org/museums-in-england'];
 	var defaultGraphIris = [];


	/**
	 * Sponate (labels)
	 */

	var mapParser = new sponate.MapParser();
	
	var labelUtilFactory = new sponate.LabelUtilFactory(prefLabelPropertyUris, prefLangs);
		
 	// A label util can be created based on var names and holds an element and an aggregator factory.
 	var labelUtil = labelUtilFactory.createLabelUtil('o', 's', 'p');

 	var labelMap = mapParser.parseMap({
		name: 'labels',
		template: [{
			id: '?s',
			displayLabel: labelUtil.getAggFactory(),
			hiddenLabels: [{id: '?o'}]
		}],
		from: labelUtil.getElement()
 	});

	
	//var conceptPathFinderApiUrl = 'http://localhost:8080/jassa/api/path-finding';
	var conceptPathFinderApiUrl = 'http://localhost/jassa/api/path-finding';
	//var conceptPathFinderApiUrl = 'http://localhost/jassa/api/path-finding';

	
	var conceptWgs84 = new facete.Concept(sparql.ElementString.create('?s <http://www.w3.org/2003/01/geo/wgs84_pos#long> ?x ;  <http://www.w3.org/2003/01/geo/wgs84_pos#lat> ?y'), rdf.NodeFactory.createVar('s'));
	var conceptGeoVocab = new facete.Concept(sparql.ElementString.create('?s <http://www.opengis.net/ont/geosparql#asWKT> ?w'), rdf.NodeFactory.createVar('s'));
	
	var geoConcepts = [conceptWgs84, conceptGeoVocab];
	
	

	var vs = rdf.NodeFactory.createVar('s');
	var vx = rdf.NodeFactory.createVar('x');
	var vy = rdf.NodeFactory.createVar('y');
	var vw = rdf.NodeFactory.createVar('w');
	
	// TODO WARNING: BUG: For all variables used in the function must be 'simple' var references, otherwise the generated query will not know about them
	var wgs84GeoView = mapParser.parseMap({
		name: 'lonlat',
		template: [{
			id: conceptWgs84.getVar(), //'?s',
			lon: vx, // '?x',
			lat: vy, // '?y'
			wkt: function(b) { return 'POINT(' + b.get(vx).getLiteralValue() + ' ' + b.get(vy).getLiteralValue() + ')';}
		}],
		from: conceptWgs84.getElement()
	});
	
	
	var ogcGeoView = mapParser.parseMap({
		name: 'lonlat',
		template: [{
		    id: conceptGeoVocab.getVar(),
		    wkt: vw
		}],
		from: conceptGeoVocab.getElement()
	});
    
    
	var intersectsFnName = 'bif:st_intersects';
	var geomFromTextFnName = 'bif:st_geomFromText';
	
	
    var wgs84MapFactory = new ns.GeoMapFactory(wgs84GeoView, new geo.BBoxExprFactoryWgs84(vx, vy));
	//var ogcMapFactory = new ns.GeoMapFactory(ogcGeoView, new geo.BBoxExprFactoryWkt(vw));
	var ogcMapFactory = new ns.GeoMapFactory(ogcGeoView, new geo.BBoxExprFactoryWkt(vw, intersectsFnName, geomFromTextFnName));

    var favFacets = [facete.Path.parse('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), facete.Path.parse('http://www.w3.org/2002/07/owl#sameAs'), facete.Path.parse('http://ns.aksw.org/spatialHierarchy/isLocatedIn')]; 

    var mapLinkFactories = [wgs84MapFactory]; //, ogcMapFactory];
    //var mapLinkFactories = [ ogcMapFactory ];
    
    /////var viewStateFetcher = new geo.ViewStateFetcher(qef, wgs84MapFactory, faceteConceptFactory);

  
    //var viewStateCtrl = null;    

    var viewStateFetcher = new geo.ViewStateFetcher();

    

	/**
	 * Angular
	 */	
	var myModule = angular.module('FaceteDBpediaExample', ['ui.bootstrap', 'ui.jassa']);

	
    /**
     * Custom directive for visibility
     * Source: https://gist.github.com/c0bra/5859295
     */
    myModule.directive('ngVisible', function () {
        return function (scope, element, attrs) {
            scope.$watch(attrs.ngVisible, function (visible) {
                element.css('visibility', visible ? 'visible' : 'hidden');
            });
        };
    });
    
    
    


    
    
    
    
    
    


	myModule.directive('ssbMap', function($timeout, $parse) {
        //console.log('starting map');
        
	    return {
	        restrict: 'EA', // says that this directive is only for html elements
	        replace: true,        
	        template: '<div></div>',
	        priority: -10,
	        link: function (scope, element, attrs) {
	            
	            // Source: https://github.com/mpriour/azimuthjs/blob/master/src/directives/olMap.js 
//                 var mapCtls = [];
//                 $.each(controls, function(i, ctl) {
//                     var opts = controlOptions[ctl] || undefined;
//                     ctl = ctl.replace(/^\w/, function(m) {
//                         return m.toUpperCase()
//                     });
//                     mapCtls.push(new OpenLayers.Control[ctl](opts));
//                 });
//                 var listeners = {};
                jQuery.each(attrs, function(key, val) {
                    var evtType = key.match(/map([A-Z]\w+)/);
                    if(evtType) {
                        evtType = evtType[1].replace(/^[A-Z]/,function(m){return m.toLowerCase()});
                        var $event = {
                            type: key
                        };
                        listeners[evtType] = function(evtObj) {
                            evtObj.evtType = evtObj.type;
                            delete evtObj.type;
                            elem.trigger(angular.extend({}, $event, evtObj));
                            //We create an $apply if it isn't happening.
                            //copied from angular-ui uiMap class
                            if(!scope.$$phase) scope.$apply();
                        };
                        var fn = $parse(val);
                        elem.bind(key, function (evt) {
                          fn(scope, evt);
                                                });
                    }
                });
                
	                //console.log('rendering map');
	                /* set text from attribute of custom tag*/
	                //element.text(attrs.text).button();
	                var $el = jQuery(element).ssbMap();
	      	      	var widget = $el.data("custom-ssbMap");
	    	      
	    	      	// Extract the map
	    	      	var map = widget.map;

	    	      	map.widget = widget;
	                var model = $parse(attrs.ssbMap);
	                //console.log('model', model);
	                //Set scope variable for the map
	                //if(model && !_(model).isFunction()) {
	                if(model) {
	                    model.assign(scope, map);//map);
	                }

	    	      	
	    	      	//parentScope.map = {};
	    	      	
// 	    	      	var inProcess = false;
// 	    	      	parentScope.$watch('map', function(state) {
// 	    	      	    if(inProcess) {
// 	    	      	        inProcess = false;
// 	    	      	        return;
// 	    	      	    }
	    	      	    
// 	    	      	    console.log('map loading state', state);
	    	      	    
// 	    	      	    widget.loadState(state);
// 	    	      	});
	    	      	
	    	      	
	    			map.events.register("moveend", this, function(event) {
	    			    if(!scope.$$phase) {
	    			        scope.$apply();
	    			    }
	    			    //console.log('moveend');
	    			    //inProcess = true;
	    			    //parentScope.map = widget.getState();
	    			});
	    			
	    			map.events.register("zoomend", this, function(event) {
	    			    if(!scope.$$phase) {
	    			        scope.$apply();
	    			    }
	    			    //inProcess = true;
	    			    //parentScope.map = widget.getState();
	    			});
	    	      	
	                
// 	    	      	parentScope.$watch('boxes', function(boxes) {
// 	    	      	    angular.forEach(boxes, function(bounds, id) {
// 	    	      	      	console.log('adbox', bounds, id);
// 	    	      	        widget.addBox(id, bounds);
// 	    	      	    });
// 						console.log('boxes', boxes);
// 	                });

	                    
	            //}, 10);/* very slight delay, even using "0" works*/
	        }
	    };
//         return function (scope, element, attr) {
//             jQuery(element).ssbMap();
//             scope.$watch(attr.ngVisible, function (visible) {
//                 element.css('visibility', visible ? 'visible' : 'hidden');
//             });
//         };
	});
	
	
/* TODO Not sure if we are going to use it - maybe yes for the info and minimize buttons in the portlet headings
	myModule.directive('portletheading', function() {
	    return {
	        restrict: "EA",
	        transclude: true,
	        template: '<div class="navbar-inner" style="min-height:20px; height:20px; position:relative;">'
				    + '    <a href="#" class="brand" style="font-size:14px; padding-top: 0px; padding-bottom: 0px;" />'
//					+ '<a href="#" class="toggle-minimized" style="position: absolute; top: 4px; right: 20px;">'
//					+ '<i class="icon-minus-sign" />'
//					+ '</a>'
                    + '    <div ng-transclude></div>'
				    + '    <a href="#" class="toggle-context-help" style="position: absolute; top: 4px; right: 5px;" data-title="Popover" data-content="Content" data-trigger="click" data-placement="bottom" rel="popover">'
				    + '        <i class="icon-info-sign" />'
				    + '    </a>'
				//+ this.nodeValue.text()
                    + '</div>'
	    };	    
	});
*/
	
	myModule.factory('sparqlServiceFactory', function() {

	    return new ns.SparqlServiceFactoryDefault();

	});
	
// 	myModule.provider('appContext', function() {
// 	    this.$get = function() { return new ns.AppContext() };
// 	});

	//var ffsAppContext = new ns.AppContext();

	myModule.service('appContext', function() {
	    return new ns.AppContext();
	    //return ffsAppContext;
	});
	
	myModule.factory('activeWorkSpaceService', function() {
	    return {
	        workSpace: null,
	
	        getWorkSpace: function() {
	            return this.workSpace;
	        },
	        
	        setWorkSpace: function(workSpace) {
			    if(this.workSpace) {
			        this.workSpace.setActive(false);
			    }
			    
				this.workSpace = workSpace;
				
				if(this.workSpace) {
					this.workSpace.setActive(true);
				}            
	        }
	    };
	});
	
	myModule.factory('activeConceptSpaceService', function() {
		return {
			conceptSpace: null,

			getConceptSpace: function() {
				return this.conceptSpace;
			},
	        
			setConceptSpace: function(conceptSpace) {
			    if(this.conceptSpace) {
			        this.conceptSpace.setActive(false);
			    }
			    
				this.conceptSpace = conceptSpace;
				
				if(this.conceptSpace) {
					this.conceptSpace.setActive(true);
				}
	    	}
		};
	    
	});
	
// 	myModule.run(function($rootScope) {
// 	    $rootScope.appContext = new ns.AppContext();
// 	});
	
	// contextCandidateMapList
	// globalActiveMapList -> grey out entries if they are not in the contextCandidate 
	myModule.factory('activeMapLinkList', function(appContext) {
		return {
		    getMapLinks: function() {
		        //console.log('Called service getMapLinks');
				return ns.AppContextUtils.getMapLinks(appContext);
		    }
		};	    
	});
	
	
	
	/* TODO Reenable
	myModule.factory('facetService', function($rootScope, $q) {
		return {
			fetchFacets: function(startPath) {
				var promise = fctTreeService.fetchFacetTree(startPath);
				var result = sponate.angular.bridgePromise(promise, $q.defer(), $rootScope);
				return result;
			}
	   };
	});
*/
	/* TODO Reenable
	myModule.controller('FavFacetsCtrl', function($scope, $rootScope, $q, facetService) {
	    
		$scope.$on('facete:refresh', function() {
		    $scope.refresh();
		});

	    
		$scope.$on('facete:constraintsChanged', function() {
		    $scope.refresh();
		});
	    
	    $scope.refresh = function() {
	        var promise = fctTreeService.fetchFavFacets(favFacets);
	        sponate.angular.bridgePromise(promise, $q.defer(), $rootScope).then(function(items) {
	            
	            _(items).each(function(item) {
				    facetTreeTagger.applyTags(item); 
	            });
	            
// 			    console.log('refreshed favFacets: ', items);
				$scope.favFacets = items;
			});
		};
	});
	*/
	
	


	/**
	 * WorkSpaceListCtrl - Controller for adding/removing work spaces
	 */
	myModule.controller('WorkSpaceListCtrl', function($rootScope, $scope, appContext, activeWorkSpaceService) {
	   
	    $scope.workSpaces = appContext.getWorkSpaces();
	    
	    $scope.addWorkSpace = function() {
	        appContext.addWorkSpace();
	    };
	    
	    $scope.removeWorkSpace = function(index) {
	        var w = appContext.getWorkSpaces()[index];
	        
	        // TODO Also deactivate the conceptSpace
	        if(w == activeWorkSpaceService.getWorkSpace()) {
	            activeWorkSpaceService.setWorkSpace(null);
	        }

	        appContext.removeWorkSpace(index);
	    };
	    
	    $scope.selectWorkSpace = function(index) {
	        var workSpace = null;

	        if(index != null) {
	        	workSpace = $scope.workSpaces[index];
	        }

	        activeWorkSpaceService.setWorkSpace(workSpace);
	    }	    
	});
	

	/**
	 * WorkSpaceConfigCtrl - Controller for configuring a work space
	 */
	myModule.controller('WorkSpaceConfigCtrl', function($scope, activeWorkSpaceService) {
	    $scope.activeWorkSpaceService = activeWorkSpaceService;
	    
	    $scope.$watch('activeWorkSpaceService.getWorkSpace()', function(workSpace) {
	        $scope.workSpace = workSpace;
	    });
	});

	
	/**
	 * ConceptSpaceListCtrl - Controller for configuring config spaces
	 */
	myModule.controller('ConceptSpaceListCtrl', function($scope, activeWorkSpaceService, activeConceptSpaceService) {

	    $scope.activeWorkSpaceService = activeWorkSpaceService;
	    
	    $scope.$watch('activeWorkSpaceService.getWorkSpace()', function(workSpace) {
	        $scope.workSpace = workSpace;
	    });

	    $scope.addConceptSpace = function() {
	        $scope.workSpace.addConceptSpace();
	    };
	    
	    $scope.removeConceptSpace = function(index) {
	        
	        var c = $scope.workSpace.getConceptSpaces()[index];
	        
	        if(c == activeConceptSpaceService.getConceptSpace()) {
	            activeConceptSpaceService.setConceptSpace(null);
	        }

	        
	        $scope.workSpace.removeConceptSpace(index);
	    };
	    
	    $scope.selectConceptSpace = function(index) {
	        var conceptSpace = null;

	        if(index != null) {
	        	conceptSpace = $scope.workSpace.getConceptSpaces()[index];
	        }
	        
	        activeConceptSpaceService.setConceptSpace(conceptSpace);
	    }
	});
	
	

/* TODO RE-ENABLE
	myModule.controller('ShowQueryCtrl', function($rootScope, $scope, conceptSpaceProvider) {
	    
	    
	    $scope.updateQuery = function() {
	        var facetService = conceptSpaceProvider.getFacetService();
	        
		    var concept = fctService.createConceptFacetValues(new facete.Path());			
			var query = facete.ConceptUtils.createQueryList(concept);			

			$scope.queryString = query.toString();	        
	    };
	    
		$scope.$on("facete:constraintsChanged", function() {
			$scope.updateQuery();
		});
	});
*/

	myModule.controller('ConstraintCtrl', function($scope, $rootScope, activeConceptSpaceService) {
	    
	    var constraintManager;
	    
	    // TODO Get rid of the service boilerplate
	    $scope.activeConceptSpaceService = activeConceptSpaceService;

	    $scope.$watch('activeConceptSpaceService.getConceptSpace()', function(conceptSpace) {
	        $scope.conceptSpace = conceptSpace;
	        
	        if(conceptSpace) {
	        	constraintManager = conceptSpace.getFacetTreeConfig().getFacetConfig().getConstraintManager();
	        }
	        
	        $scope.refresh();
	    });

	    var renderConstraint = function(constraint) {
	        var type = constraint.getName();

	        var result;
	        switch(type) {
	        case 'equal':
	            var pathStr = ''  + constraint.getDeclaredPath();
	            if(pathStr === '') {
	                pathStr = '()'
	            }
	        	result = pathStr + ' = ' + constraint.getValue();
	        break;
	        default:
	            result = constraint;
	        }
	        
	        return result;
	    };
	    
	    $scope.$on('facete:refresh', function() {
		    $scope.refresh();
		});
	    
		$scope.refresh = function() {
		    $scope.refreshConstraints();
		};
		
	    $scope.refreshConstraints = function() {	        
	        var items;
	        if($scope.conceptSpace) {
		        var constraints = constraintManager.getConstraints();
		        
		        items =_(constraints).map(function(constraint) {
					var r = {
						constraint: constraint,
						label: '' + renderConstraint(constraint)
					};
					
					return r;
		        });
	        }
	        else {
	            items = [];
	        }

	        $scope.constraints = items;
	    };
	    
	    $scope.removeConstraint = function(item) {	
	        constraintManager.removeConstraint(item.constraint);
			$scope.$emit('facete:constraintsChanged');
	    };
	    
		$scope.$on("facete:constraintsChanged", function() {
			$scope.refreshConstraints();
		});
	});
	
	myModule.controller('FacetValueListCtrl', function($scope, $q, $rootScope, activeConceptSpaceService, sparqlServiceFactory) {

	    $scope.activeConceptSpaceService = activeConceptSpaceService;
	    $scope.conceptSpace = null;
	    
	    var sparqlService;
	    var facetConfig;
        var facetConceptGenerator;

        var facetService;

	    var facetService;
	    var constraintTaggerFactory;
	   
	    var labelsStore;
	    
	    $scope.$watch('activeConceptSpaceService.getConceptSpace()', function(conceptSpace) {
	        $scope.conceptSpace = conceptSpace;

	        if(conceptSpace) {
	            
	            var wsConf = conceptSpace.getWorkSpace().getData().config;

	            sparqlService = sparqlServiceFactory.createSparqlService(wsConf.sparqlServiceIri, wsConf.defaultGraphIris);
				facetConfig = conceptSpace.getFacetTreeConfig().getFacetConfig();
				facetConceptGenerator = ns.FaceteUtils.createFacetConceptGenerator(facetConfig);
				facetService = new facete.FacetServiceImpl(sparqlService, facetConceptGenerator, labelMap);
				constraintTaggerFactory = new facete.ConstraintTaggerFactory(facetConfig.getConstraintManager());
				
				var store = new sponate.StoreFacade(sparqlService);
				store.addMap(labelMap, 'labels');
				labelsStore = store.labels;
				
	        } else {
// 				facetTreeConfig = null;
// 				$scope.pathToFilterString = null;
	        }
	        
	        //$scope.pathToFilterString = conceptSpace.getFacetConfig().getPathToFilterString();
	        $scope.refresh();	        
	    });

	    
	    $scope.filterText = '';
		$scope.totalItems = 64;
		$scope.currentPage = 1;
		$scope.maxSize = 5;
		
// 		$scope.firstText = '<<';
// 		$scope.previousText = '<';
// 		$scope.nextText = '>';
// 		$scope.lastText = '>>';

		$scope.toggleConstraint = function(item) {
	        var constraintManager = facetConfig.getConstraintManager();

		    
			var constraint = new facete.ConstraintSpecPathValue(
					'equal',
					item.path,
					item.node);

			// TODO Integrate a toggle constraint method into the filterManager
			constraintManager.toggleConstraint(constraint);
// 			var hack = constraintManager.removeConstraint(constraint);
// 			if(!hack) {
// 				constraintManager.addConstraint(constraint);
// 			}

			$rootScope.$broadcast('facete:constraintsChanged');
		};
		
		
		
		var updateItems = function() {
			if(!$scope.conceptSpace) {
			    //console.log('No concept space');
			    return;
			}
	        
	        //var constraintTaggerFactory = conceptSpace.getContraintTaggerFactory();
	        //var constraintManager = conceptSpace.getConstraintManager();

		    
			var path = $scope.path;
			if(path == null) {
				return;
			}

			var concept = facetConceptGenerator.createConceptResources(path, true);
			
			var text = $scope.filterText;
			console.log('FilterText: ' + text);
			var criteria = {};
			if(text) {
			    criteria = {$or: [
			        {hiddenLabels: {$elemMatch: {id: {$regex: text, $options: 'i'}}}},
			        {id: {$regex: text, $options: 'i'}}
			    ]};
			}
			var baseFlow = labelsStore.find(criteria).concept(concept, true);

			var countPromise = baseFlow.count();
			
			var pageSize = 10;
	 		
			var dataFlow = baseFlow.skip(($scope.currentPage - 1) * pageSize).limit(pageSize);

			var dataPromise = dataFlow.asList(true).pipe(function(docs) {

			    var tagger = constraintTaggerFactory.createConstraintTagger(path);
			    
			    var r = _(docs).map(function(doc) {
			        // TODO Sponate must support retaining node objects
			        //var node = rdf.NodeFactory.parseRdfTerm(doc.id);
			        var node = doc.id;
			        
			        var label = doc.displayLabel ? doc.displayLabel : '' + doc.id;
			        //console.log('displayLabel', label);
			        var tmp = {
			            displayLabel: label,
						path: path,
						node: node,
						tags: tagger.getTags(node)
			        };

			        return tmp;
			        
			    });

			    return r;
			});
			

			sponate.angular.bridgePromise(countPromise, $q.defer(), $rootScope).then(function(count) {
			    $scope.totalItems = count; 
			});
			
			sponate.angular.bridgePromise(dataPromise, $q.defer(), $rootScope).then(function(items) {
			    $scope.facetValues = items;
			});

		};

		$scope.filterTable = function(filterText) {
		    $scope.filterText = filterText;
			updateItems();		    
		};
		

		$scope.$on('facete:refresh', function() {
		    $scope.refresh();
		});
	    
		$scope.refresh = function() {
		    updateItems();
		};

		$scope.$watch('currentPage', function() {			
			//console.log("Change");
			updateItems();
		});
		
		$scope.$on('facete:facetSelected', function(ev, path) {

			$scope.currentPage = 1;
			$scope.path = path;
			
			updateItems();
		});
		
		$scope.$on('facete:constraintsChanged', function() {
		    updateItems(); 
		});

	});
				
	
	myModule.controller('ResultSetTableCtrl', function($scope) {
	    $scope.refresh = function() {
	        //tableMod = 
	    };
	});
	
	/**
	 * Broadcasts facete related events down again; essenntially
	 * used so that sibling elements can react to the events.
	 *
	 */
	myModule.controller('FaceteContextCtrl', function($scope, activeMapLinkList) {

	    $scope.activeMapLinkList = activeMapLinkList;
	    $scope.$watch('activeMapLinkList.getMapLinks()', function(mapLinks) {
            //console.log('handled change getMapLinks()'); 
	    }, true);
	    
	    var broadcast = function(eventName, args) {
	        var ev = args[0];
	        var remainingArgs = Array.prototype.slice.call(args, 1);	        
	        var newArgs = [eventName].concat(remainingArgs);	        

	        if(ev.targetScope.$id != ev.currentScope.$id) {
	            $scope.$broadcast.apply($scope, newArgs);
	        }	        
	    };
	    
	    var forwardEvent = function(eventName) {
	        $scope.$on(eventName, function() {
	            broadcast(eventName, arguments);
	        });
	    };
	    
	    var events = ['facete:facetSelected', 'facete:constraintsChanged', 'facete:refresh', 'facete:workSpaceSelected', 'facete:conceptSelected'];
	    
	    _(events).each(function(event) { forwardEvent(event); });
	});
				
	 
	var ModalInstanceCtrl = function($scope, $modalInstance, aggs, selected) {	    
	    $scope.aggs = aggs;
	    
// 	    $scope.selected = {
//     		agg: $scope.aggs[0]
//   		};

		$scope.selected = selected;
	    
	    $scope.ok = function () {
	        $modalInstance.close($scope.selected);
	    };

	    $scope.cancel = function () {
	        $modalInstance.dismiss('cancel');
	    };
	};
	    
	
	
	
    myModule.controller('CreateTableCtrl', function($scope, $modal, $log) {

        $scope.columns = [];
        
        //var tableMod = new facete.T
        
        
        //$scope.sortDirections = [];

//         $scope.columns = [{
//             isRemoveable: true,
//             isConfigureable: true,
//             isSortable: true,
            
//             displayName: 'test',
            
//             sortDirection: 0
//         }];
        
	    // TODO For complex aggregation expressions we may need to add an
	    // 'unknown' or 'retain' option to retain the current choice
	    $scope.aggs = [{
	    	label: 'None'
	    }, {
	        label: 'Count'
	    }, {
	        label: 'Average'
	    }, {
	        label: 'Min'
	    }, {
	        label: 'Max'
	    }];

        
        $scope.configureColumn = function(index) {
            var column = $scope.columns[index];
            console.log($scope.columns);
            
            var modalInstance = $modal.open({
                templateUrl: 'configureColumnContent.html',
                controller: ModalInstanceCtrl,
                resolve: {
                    selected: function() {
                        return {agg: column.agg };
                    },

                    aggs: function () {
                        return $scope.aggs;
                    }
                }
            });

            modalInstance.result.then(function(data) {
                
                column.agg = data.agg;
                
                //alert(JSON.stringify(data));
                //$scope.selected = selectedItem;
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });            
        };
        
        $scope.removeColumn = function(index) {
            var column = $scope.columns[index];
            var path = column.path;
            
		    tableMod.togglePath(path);
		    $scope.$emit('facete:refresh');  
        };
        
        $scope.sortColumn = function(index, sortDirection, isShiftPressed) {
            var column = $scope.columns[index];
            var currentSortDir = column.sortDirection;

            column.sortDirection = sortDirection;

            
            
            //sortDirections.push(sortDirection);
//             if(currentSortDir == column.sortDirection) {
//                 column.sortDirection = sortDirection;
//             } else {
//                 column.sortDirection = sortDirection;
//             }
        };
        

        
        $scope.refresh = function() {
            return; //TODO Finish
            
            var paths = tableMod.getPaths().getArray();
            
            var columns = _(paths).map(function(path) {
                var column = {
	                isRemoveable: true,
	                isConfigureable: true,
	                isSortable: true,
	                sortDirection: 0,
                
                	displayName: 'test',

                	path: path
            	};

                return column;
            });
            
            $scope.columns = columns;
            console.log('recolumns ', columns);
        };
        
        
		$scope.$on('facete:refresh', function() {
		    $scope.refresh();
		});

    });
	 
    
/* TODO REENABLE    
    myModule.controller('FacetTreeSearchCtrl', function($rootScope, $scope, $q, facetService) {
        $scope.items = [{name: 'foo'}];
        
		$scope.$watch('searchText', function(newValue) {
		    console.log('searchText: ', newValue);
		    if(!newValue || newValue == '') {
		        return;
		    }
		    
		    var conceptPathFinder = new client.ConceptPathFinderApi(conceptPathFinderApiUrl, sparqlServiceIri, defaultGraphIris);
		    
		    var sourceConcept = fctService.createConceptFacetValues(new facete.Path());			

			var targetVar = rdf.NodeFactory.createVar('s');
			//var targetConcept = new facete.Concept(sparql.ElementString.create('?s ?p ?o . Filter(regex(str(?p), "' + newValue + '", "i"))'), targetVar);
			var targetConcept = new facete.Concept(sparql.ElementString.create('?s <http://www.w3.org/2003/01/geo/wgs84_pos#long> ?x ;  <http://www.w3.org/2003/01/geo/wgs84_pos#lat> ?y'), targetVar);

		    var promise = conceptPathFinder.findPaths(sourceConcept, targetConcept);
			var result = sponate.angular.bridgePromise(promise, $q.defer(), $rootScope);

			result.then(function(paths) {
			    console.log('Paths', paths);
			    var tmp = _(paths).map(function(path) {
			        
			        var geoConcept = fctService.createConceptFacetValues(path);
			        
			        return {name: path.toString(), geoConcept: geoConcept.toString() };
			    });
			   
			    $scope.items = tmp;
			}, function(err) {
			    alert(err.responseText);
			});

			console.log('SearchText', newValue);
		});

    });
*/    
    
    myModule.controller('MapCtrl', function($scope, appContext, sparqlServiceFactory) {
        $scope.boxes = {foo: {left: -10, bottom: -10, right: 10, top: 10}};
        
        
        var refresh;
        
        $scope.$watch('map.center', function(center) {
            refresh();
        });
        
        $scope.$on('facete:refresh', function() {
            refresh();
        });

        $scope.$on('facete:constraintsChanged', function() {
            refresh();
        });

        
        refresh = function() {
            var bounds = ns.MapUtils.getExtent($scope.map)
            //console.log('extent', bounds);
            
//             if(viewStateCtrl == null) {
//                 viewStateCtrl = new ns.ViewStateCtrlOpenLayers($scope.map.widget);
//             }


            $scope.map.widget.clearItems();

            
            var mapLinkIndex = 0;
            
            _(appContext.getWorkSpaces()).each(function(workSpace) {
                
	            var wsConf = workSpace.getData().config;
                
                _(workSpace.getConceptSpaces()).each(function(conceptSpace) {
        
                    var sparqlService = sparqlServiceFactory.createSparqlService(wsConf.sparqlServiceIri, wsConf.defaultGraphIris);
            		var facetConfig = conceptSpace.getFacetTreeConfig().getFacetConfig();
            		var facetConceptGenerator = ns.FaceteUtils.createFacetConceptGenerator(facetConfig);

                    var paths = conceptSpace.getData().activeMapLinkPaths.getArray();
                    

            		_(paths).each(function(path) {
            		    
            		    var markerFillColor = markerFillColors[mapLinkIndex];
            		    var markerStrokeColor = markerStrokeColors[mapLinkIndex];
            		    
        				var concept = facetConceptGenerator.createConceptResources(path); 
        				
                        //console.log('PAAAAA ' + geoConcept);
                        
                        
                        var mapLinkFactory = mapLinkFactories[0];
                        var promise = viewStateFetcher.fetchViewState(sparqlService, mapLinkFactory, concept, bounds);
                        
                        promise.done(function(viewState) {
                            var nodes = viewState.getNodes();
                            
	                	    _(nodes).each(function(node) {
	                	        //console.log('booooo', node);
	                	        if(!node.isLoaded) {
	                	            //console.log('box: ' + node.getBounds());
	                	            $scope.map.widget.addBox('' + node.getBounds(), node.getBounds());
	                	        }
	                	        
	                	        var data = node.data || {};
	                    	    var docs = data.docs || [];
	
	                    	    _(docs).each(function(doc) {
	         
	                    	        $scope.map.widget.addWkt(doc.id, doc.wkt, {fillColor: markerFillColor, strokeColor: markerStrokeColor});
	                    	    });        	        
	                	    });
                        });
                        
                        ++mapLinkIndex;
            		});
                                        
                });
            });
            
		    //var concept = fctService.createConceptFacetValues(new facete.Path());
/* TODO RE-ENABLE		    
			viewStateFetcher.fetchViewState(bounds).done(function(viewState) {
			   //var nodes = viewState.getNodes();
			   //console.log('viewStateNodes', nodes);
			   
			   viewStateCtrl.updateView(viewState);			   
			});
*/
/*            
        	var promise = qtc.fetchData(bounds);
        	promise.done(function(nodes) {
                $scope.map.widget.clearItems();
        	    console.log('nodes', nodes);

        	    _(nodes).each(function(node) {
        	        
        	        if(!node.isLoaded) {
        	            console.log('box: ' + node.getBounds());
        	            $scope.map.widget.addBox('' + node.getBounds(), node.getBounds());
        	        }
        	        
        	        var data = node.data || {};
            	    var docs = data.docs || [];

            	    _(docs).each(function(doc) {
 
            	        $scope.map.widget.addWkt(doc.id, doc.wkt);
            	        
            	        //var wktParser = new OpenLayers.Format.WKT();
                 	    //var polygonFeature = wktParser.read(wkt);
            	        //console.log('wkt: ', polygonFeature);
                 	    //polygonFeature.geometry.transform(map.displayProjection, map.getProjectionObject());         
            	    });        	        
        	    });
        	    
//         	    vectors.addFeatures([polygonFeature]);
        	});
*/          
        };
    });


	
	myModule.controller('CandidateMapLinkListCtrl', function($scope, $rootScope, $q, sparqlServiceFactory, activeConceptSpaceService, activeMapLinkList) {

	    $scope.mapLinks = [];
	    
	    // TODO Get rid of the service boilerplate
	    $scope.activeConceptSpaceService = activeConceptSpaceService;
	    
	    var sparqlService;
	    var facetConfig;
	    var facetConceptGenerator;
	   
	    $scope.conceptSpace = null;
	    
	    $scope.$watch('activeConceptSpaceService.getConceptSpace()', function(conceptSpace) {
	        $scope.conceptSpace = conceptSpace;

	        if(conceptSpace) {
	            
	            var wsConf = conceptSpace.getWorkSpace().getData().config;

	            sparqlService = sparqlServiceFactory.createSparqlService(wsConf.sparqlServiceIri, wsConf.defaultGraphIris);
				facetConfig = conceptSpace.getFacetTreeConfig().getFacetConfig();
				facetConceptGenerator = ns.FaceteUtils.createFacetConceptGenerator(facetConfig);
				
				
		    	var data = conceptSpace.getData();
		        if(!data.activeMapLinkPaths) { data.activeMapLinkPaths = new util.ArrayList(); }				
	        } else {
	            $scope.mapLinks = [];
	        }

	        $scope.refresh();
	    });
	    
	    
	    $scope.activeMapLinkList = activeMapLinkList;
	    $scope.$watch('activeMapLinkList.getMapLinks()', function(mapLinks) {
            $scope.refresh(); 
	    }, true);
	    
	    $scope.toggleMapLink = function(index) {
	        // Check the conceptSpace for whether the mapLink is active
	        var item = $scope.mapLinks[index];
	        

	        var path = item.path;
			var paths = $scope.conceptSpace.getData().activeMapLinkPaths;
			util.CollectionUtils.toggleItem(paths, path);

			item.isActive = paths.contains(path);
			
			
			$scope.$emit('facete:refresh');
			//console.log('Map Links after activation:', activeMapLinkList.getMapLinks());
	    };
	    
		$scope.$on('facete:constraintsChanged', function() {
		    $scope.refresh();
		});
		
		$scope.refresh = function() {
		    if(!$scope.conceptSpace) {
		        return;
		    }
		    
		    var conceptPathFinder = new client.ConceptPathFinderApi(conceptPathFinderApiUrl, sparqlServiceIri, defaultGraphIris);
		    
		    // For each vocab, get the candidates
			var sourceConcept = facetConceptGenerator.createConceptResources(new facete.Path());

		    
			var promises = _(mapLinkFactories).map(function(mapLinkFactory) {
			    //var mapLinkFactory = mapLinkFactories[0];
			    
				// TODO HACK Get the concept (id) from the map
			    var targetVar = rdf.NodeFactory.createVar('s');
				var element = mapLinkFactory.createMapForGlobal().getElementFactory().createElement();
				
				var targetConcept = new facete.Concept(element, targetVar);

				console.log('[DEBUG] ConceptPathFinder: Search paths between ' + sourceConcept + ' and ' + targetConcept);
				
			    var p = conceptPathFinder.findPaths(sourceConcept, targetConcept).pipe(function(paths) {
			        var items = _(paths).map(function(path) {
			            var r = {
			            	path: path,
			            	mapLinkFactory: mapLinkFactory
			            };
			            
			            return r;
			        });
			        
			        return items;
			    });

			    
			    return p;
			});
			
			var promise = jQuery.when.apply(window, promises).pipe(function() {
			    var flatten = _(arguments).flatten();
// 			    console.log('ARGS', arguments);
// 			    console.log('ARGS2', flatten);
			    return flatten;
			});

			var result = sponate.angular.bridgePromise(promise, $q.defer(), $rootScope);

			//console.log('Paths:', paths);
				
			result.then(function(items) {
				var activeMapLinkPaths = $scope.conceptSpace.getData().activeMapLinkPaths;

			    var tmp = _(items).map(function(item) {
		        	console.log('ITEM', item);
			        item.name = item.path.toString();
			        
			        if(item.name == '') {
			            item.name = '(empty property path)';
			        }
			        
			        item.isActive = activeMapLinkPaths.contains(item.path);

			        return item;
// 			        return {
// 			            isActive: isActive,
// 			            name: path.toString(),
// 			            path: path,
// 			            mapLinkFactory: mapLinkFactory
// 			        };//, geoConcept: geoConcept.toString() };
				});
				
			    $scope.mapLinks = tmp;
			}, function(err) {
			    alert(err.responseText);
			});

		};
	});
	
    myModule.controller('ActiveMapLinkListCtrl', function($scope, activeMapLinkList, activeConceptSpaceService) {
        
	    
	    // TODO Get rid of the service boilerplate
        $scope.activeMapLinkList = activeMapLinkList;
	    $scope.activeConceptSpaceService = activeConceptSpaceService;
        
        $scope.$watch('activeMapLinkList.getMapLinks()', function(mapLinks) {
           	$scope.mapLinks = mapLinks;
        }, true);
        
	    $scope.$watch('activeConceptSpaceService.getConceptSpace()', function(conceptSpace) {
	        $scope.conceptSpace = conceptSpace;	        
	    });

        
        $scope.removeMapLink = function(index) {
            var mapLink = $scope.mapLinks[index];
            $scope.conceptSpace.getData().activeMapLinkPaths.remove(mapLink.path);
//             $scope.$apply(function() {
//             	$scope.conceptSpace.getData().activeMapLinkPaths.remove(mapLink.path);
//             });
        };
    });

    
    
    myModule.controller('TestCtrl', ['$scope', 'activeConceptSpaceService', 'sparqlServiceFactory', function($scope, activeConceptSpaceService, sparqlServiceFactory) {
        

	    // TODO Get rid of the service boilerplate
	    $scope.activeConceptSpaceService = activeConceptSpaceService;
	    
	    $scope.conceptSpace = null;
	    
	    $scope.$watch('activeConceptSpaceService.getConceptSpace()', function(conceptSpace) {
	        $scope.conceptSpace = conceptSpace;

	        var wsConf = conceptSpace ? conceptSpace.getWorkSpace().getData().config : null;

	        $scope.sparqlService = conceptSpace ? sparqlServiceFactory.createSparqlService(wsConf.sparqlServiceIri, wsConf.defaultGraphIris) : null;
			$scope.facetTreeConfig = conceptSpace ? conceptSpace.getFacetTreeConfig() : null
	    });


//        $scope.sparqlService = new service.SparqlServiceCache(new service.SparqlServiceHttp('http://localhost/fts-sparql'));
//        $scope.facetTreeConfig = new ns.FacetTreeConfig();
        
        $scope.selectFacet = function(path) {
            //alert('selectFacet: ' + path);
		    $scope.$emit('facete:facetSelected', path);
        };
    }]);
    
	</script>



<!-- 						Foobaz: {{foobaz}} -->
<!-- 						WTF {{facet.item.getPath()}}: {{facet.isOutgoingActive}}, {{activeOutgoingTab}} -->

<!--  active="facet.expansionState == 2" -->

		<!-- ng-show="facet.pageCount > 1 || facet.children.length > 5" -->
<!--         		        <div style="width:100%; background-color: #eeeeff;"> -->
<!-- 				    		<div style="padding-right: 16px; padding-left: {{16 * (facet.item.getPath().getLength() + 1)}}px"> -->
<!-- 		<form ng-submit="doFilter(facet.item.getPath(), facet.filter.filterString)"> -->
<!-- 								<div class="input-group"> -->
<!--                             		<input type="text" class="form-control" placeholder="Filter" ng-model="facet.filter.filterString" value="{{facet.filter.filterString}}" /> -->
<!--                             		<span class="input-group-btn"> -->
<!--                                 <button type="submit" class="btn btn-default">Filter</button> -->
<!--                             		</span> -->
<!-- 								</div>			    	     -->
<!-- 		</form> -->
<!-- 				    		</div> -->
<!--                 		</div> -->

<!--                 		<div ng-show="facet.pageCount != 1" style="width:100%; background-color: #eeeeff"> -->
<!--     		         		<pagination style="padding-left: {{16 * (facet.item.getPath().getLength() + 1)}}px" class="pagination-mini" max-size="7" total-items="facet.childFacetCount" page="facet.pageIndex" boundary-links="true" rotate="false" on-select-page="selectFacetPage(page, facet)" first-text="<<" previous-text="<" next-text=">" last-text=">>"></pagination> -->
<!--                 		</div> -->

<!-- 			    		<span ng-show="facet.children.length == 0" style="color: #aaaaaa; padding-left: {{16 * (facet.item.getPath().getLength() + 1)}}px">(no entries)</span> -->

<!--  			    		<div style="padding-left: {{16 * (facet.item.getPath().getLength() + 1)}}px" ng-repeat="facet in facet.children" ng-include="'facet-tree-item.html'"></div> -->


	<script type="text/ng-template" id="result-set-browser.html">
		<div class="frame">
			<form ng-submit="filterTable(filterText)">
			    <input type="text" ng-model="filterText" />
				<input class="btn-primary" type="submit" value="Filter" />
			</form>
			<table>
                <tr><th>Value</th><th>Constrained</th></tr>
<!-- <th>Count</th> -->
			    <tr ng-repeat="item in facetValues">
                    <td>{{item.displayLabel}}</td>
<!--                    <td>todo</td> -->
                    <td><input type="checkbox" ng-model="item.tags.isConstrainedEqual" ng-change="toggleConstraint(item)" /></td>
                </tr>
        	</table>
    		<pagination class="pagination-small" total-items="totalItems" page="$parent.currentPage" max-size="maxSize" boundary-links="true" rotate="false" num-pages="numPages"></pagination>
		</div>
	</script>
	
	
	<script type="text/ng-template" id="configureColumnContent.html">
        <div class="modal-header">
            <h3>Column Configuration</h3>
        </div>
        <div class="modal-body">
            <table>
                <tr><td>Path</td><td>{{item}}</td></tr>
            </table>
            <hr />
			Heading
			<input type="text" ng-model="columnName" />
            Aggregation {{selected.agg}}
            <select ng-model="selected.agg" ng-options="agg.label for agg in aggs" />
        </div>
        <div class="modal-footer">
            <button class="btn btn-primary" ng-click="ok()">OK</button>
            <button class="btn btn-warning" ng-click="cancel()">Cancel</button>
        </div>
    </script>
	
</head>

<body ng-controller="FaceteContextCtrl">

<!-- style="position:fixed; width:100%; height: 100%" -->
<!-- 	<div style="position:fixed; width:100%; height: 100%"> -->
		 
		 
	 	<div style="position: absolute; top: 0px; left: 0px; width: 470px; max-height: 100%; overflow: auto; margin: 5px;">

						<div class="panel panel-info" ng-controller="WorkSpaceListCtrl"> <!-- data-ng-init="refreshConstraints()" --> 
							<div class="panel-heading">
    							<h4 class="panel-title">Work Spaces</h4>
  							</div>
  							<div class="panel-body">
							
								<ul>
							    	<li ng-show="workSpaces.length == 0" class="inactive">(no work spaces)</li>
								    <li ng-repeat="workSpace in workSpaces" ng-class="{'highlite': workSpace.isActive()}">
								    	<a href="" ng-click="removeWorkSpace($index)"><span class="glyphicon glyphicon-remove-circle"></span></a>
								    	<a href="" ng-click="selectWorkSpace($index)">{{workSpace.getName()}}</a>
								   	</li>
								</ul>
								
								<button class="btn btn-primary" ng-click="addWorkSpace()">New Work Space</button>
							</div>
						</div>
						
						
						<div class="panel panel-info" ng-controller="WorkSpaceConfigCtrl">
							<div class="panel-heading">
    							<h4 class="panel-title">Work Space Settings</h4>
  							</div>
  							<div class="panel-body">

								<div ng-show="!workSpace" class="inactive">(no active work space)</div>
								<div ng-show="workSpace">
									Sparql Endpoint: <input type="search" ng-model="workSpace.getData().config.sparqlServiceIri" /><button>Set</button> <br />
								</div>
							</div>
						</div>						
						

						<div class="panel panel-info" ng-controller="ConceptSpaceListCtrl">
							<div class="panel-heading">
    							<h4 class="panel-title">Concepts</h4>
  							</div>
  							<div class="panel-body">
							
								<div ng-show="!workSpace" class="inactive">(no active work space)</div>
								<div ng-show="workSpace">
									<ul>
										<li ng-hide="workSpace.getConceptSpaces().length" class="inactive">(no concept spaces)</li>
										<li ng-repeat="conceptSpace in workSpace.getConceptSpaces()" ng-class="{'highlite': conceptSpace.isActive()}">
											<a href="" ng-click="removeConceptSpace($index)"><span class="glyphicon glyphicon-remove-circle"></span></a>
								    		<a href="" ng-click="selectConceptSpace($index)">{{conceptSpace.getName()}}</a>
										</li>
									</ul>
								</div>
								<button ng-show="workSpace" class="btn btn-primary" ng-click="addConceptSpace()">New Concept Space</button>							
							</div>
						</div>
						
<!--						
					    <div class="portlet" ng-controller="FavFacetsCtrl" data-ng-init="refresh()">
					        <span ng-show="favFacets.length == 0">No favourited facets</span> 
					        <ul ng-repeat="facet in favFacets">
								<li ng-controller="FacetTreeCtrl"><div ng-include="'facet-tree-item.html'"></div></li>
							</ul>
					    </div>
-->
  
						<div class="panel panel-info">
							<div class="panel-heading">
    							<h4 class="panel-title">Facet Tree</h4>
  							</div>  							
  							<div class="panel-body">
  								<facet-tree ng-controller="TestCtrl" sparql-service="sparqlService" facet-tree-config="facetTreeConfig" select="selectFacet(path)" />  							
							</div>
						</div>
					
						<div class="panel panel-info" ng-controller="FacetValueListCtrl">
							<div class="panel-heading">
    							<h4 class="panel-title">Facet Values</h4>
  							</div>
  							<div class="panel-body">
								<div ng-include="'result-set-browser.html'"></div>
							</div>	
						</div>
						
						<div class="panel panel-info" ng-controller="ConstraintCtrl" data-ng-init="refreshConstraints()">
							<div class="panel-heading">
    							<h4 class="panel-title">Constraints</h4>
  							</div>
  							<div class="panel-body">						
								<ul>
						    		<li ng-show="constraints.length == 0" style="color: #aaaaaa;">(no constraints)</li>
							    	<li ng-repeat="constraint in constraints"><a href="" ng-click="removeConstraint(constraint)">{{constraint.label}}</a></li>
								</ul>
							</div>
						</div>
						
<!-- 						<div ng-controller="ShowQueryCtrl" data-ng-init="updateQuery()"> -->
<!-- 							<span>Query = {{queryString}}</span>	 -->
<!-- 						</div>						 -->

		</div>			

<!-- 		<div ssb-map style="position: absolute; z-index:-9999; top: 0px; left: 0px; width: 100%; height: 100%;" ng-controller="MapCtrl"></div> -->

		<div class="panel panel-info" style="position: absolute; top: 0px; left: 550px; margin: 5px;"> 
			<div class="panel-heading">
				<h4 class="panel-title">Map Links</h4>
			</div>
			<div class="panel-body">
				<tabset>
					<tab heading="Candidate Map Links">
						<div ng-controller="CandidateMapLinkListCtrl">
							<ul>
								<li ng-hide="mapLinks.length" class="inactive">(no map link candidates)</li>
								<li ng-repeat="mapLink in mapLinks">
									<input type="checkbox" ng-model="mapLink.isActive" ng-change="toggleMapLink($index)" />
									{{mapLink.name}}
								</li>
				  			</ul>
				  		</div>
				  	</tab>
					<tab heading="Active Map Links">
						<div ng-controller="ActiveMapLinkListCtrl">
							<ul>
								<li ng-hide="mapLinks.length" class="inactive">(no map links)</li>
								<li ng-repeat="mapLink in mapLinks">
									<a href="" ng-click="removeMapLink($index)"><span class="glyphicon glyphicon-remove-circle"></span></a>{{mapLink.path}}
								</li>
							</ul>
						</div>
					</tab>
				</tabset>
			</div>
  		</div>


		<div class="panel panel-info" style="position: absolute; bottom: 0px; left: 550px; margin: 5px; width: 50%; max-height: 30%;">
			<div class="panel-heading">
				<h4 class="panel-title">Data</h4>
			</div>
			
<!-- 			        	<div ng-controller="FacetTreeSearchCtrl"> -->
<!-- 			        		<input type="search" ng-model="searchText" /><button>Search</button> -->
<!-- 			        		<ul> -->
<!-- 			        			<li ng-repeat="item in items">{{item.name}} - {{item.geoConcept}}</li> -->
<!-- 			        		</ul> -->
<!-- 			        	</div> -->
			        
						<div ng-controller="CreateTableCtrl" data-ng-init="refresh()">
						    <table>
							    <tr><th ng-repeat="column in columns">
								
								    <a href="" ng-click="removeColumn($index)"><span ng-show="column.isRemoveable" class="glyphicon glyphicon-remove-circle"></span></a>
								    {{column.displayName}}
								    <a href="" ng-click="configureColumn($index)"><span ng-show="column.isConfigureable" class="glyphicon glyphicon-edit"></span></a>
					
									<a href="" ng-visible="column.isSortable && column.sortDirection >= 0" ui-keydown="{shift: 'shiftPressed=true'}" ui-keyup="{shift: 'shiftPressed=false'}" ng-click="sortColumn($index, (column.sortDirection == 0 ? 1 : 0), shiftPressed)"><span ng-show="column.isSortable" class="glyphicon glyphicon-arrow-up"></span></a>
									<a href="" ng-visible="column.isSortable && column.sortDirection <= 0" ui-keydown="{shift: 'shiftPressed=true'}" ui-keyup="{shift: 'shiftPressed=false'}" ng-click="sortColumn($index, (column.sortDirection == 0 ? -1 : 0), shiftPressed)"><span ng-show="column.isSortable" class="glyphicon glyphicon-arrow-down"></span></a>
							    </th></tr>		
						    </table>
						</div>	        
		
		</div>


		<div style="position: absolute; top: 0px; left: 0px; width: 100%; height: 100%; z-index:-9999" ng-controller="MapCtrl">
			<div ssb-map="map" style="width: 100%; height: 100%"></div>
		</div>	        

<!-- 	</div> -->
		
</body>

</html>
