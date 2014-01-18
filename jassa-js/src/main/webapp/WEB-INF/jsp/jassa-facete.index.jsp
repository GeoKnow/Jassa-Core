<!DOCTYPE html>
<html ng-app="FaceteDBpediaExample">

<head>
	<meta content="text/html; charset=utf-8" http-equiv="Content-Type">
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />

	<title>Facete Example: DBpedia</title>
	<link rel="stylesheet" href="resources/css/bootstrap-2.3.2-pagination.css" />
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
	    background-color: #ddeeff;
	}
	
	input[type=text] .btn-xs, input[type=password] .btn-xs {
        height: 14px !important;
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
    
	</style>
	
	<!--  TODO PrefixMapping Object von Jena portieren ~ 9 Dec 2013 -->
	
	<script src="resources/libs/jquery/1.9.1/jquery.js"></script>
	<script src="resources/libs/twitter-bootstrap/3.0.1/js/bootstrap.js"></script>
	
	<script src="resources/libs/underscore/1.4.4/underscore.js"></script>
	<script src="resources/libs/underscore.string/2.3.0/underscore.string.js"></script>
	<script src="resources/libs/prototype/1.7.1/prototype.js"></script>

<!-- 	<script src="resources/libs/angularjs/1.0.8/angular.js"></script> -->
<!-- 	<script src="resources/libs/angularjs/1.2.0-rc.2/angular.js"></script>	 -->
	<script src="resources/libs/angularjs/1.2.0-rc.3/angular.js"></script>	
	<script src="resources/libs/angular-ui/0.7.0/ui-bootstrap-tpls-0.7.0.js"></script>
	<script src="resources/libs/ui-router/0.2.0/angular-ui-router.js"></script>

	<script src="resources/libs/monsur-jscache/2013-12-02/cache.js"></script>

	${jsIncludes}


    <script type="text/javascript" src="resources/libs/jquery-ui/1.10.2/ui/jquery-ui.js"></script>

	<script src="resources/js/facete/facete-playground.js"></script>

    <script type="text/javascript" src="resources/libs/open-layers/2.12/OpenLayers.js"></script>

    <script type="text/javascript" src="resources/libs/open-layers/2.12/OpenLayers.js"></script>
    <script type="text/javascript" src="resources/js/geo/jquery.ssb.map.js"></script>
	
	<script type="text/javascript">
	_.mixin(_.str.exports());

	
	var prefLabelPropertyUris = [
//    		'http://www.w3.org/2004/02/skos/core#prefLabel',
//    	    'http://purl.org/dc/elements/1.1/title',
//    	    'http://purl.org/dc/terms/title',

//    	    'http://swrc.ontoware.org/ontology#title',
//    	    'http://xmlns.com/foaf/0.1/name',
//    	    'http://usefulinc.com/ns/doap#name',
//    	    'http://rdfs.org/sioc/ns#name',
//    	    'http://www.holygoat.co.uk/owl/redwood/0.1/tags/name',
//    	    'http://linkedgeodata.org/vocabulary#name',
//    	    'http://www.geonames.org/ontology#name',
//    	    'http://www.geneontology.org/dtds/go.dtd#name',

   	    'http://www.w3.org/2000/01/rdf-schema#label'

//    	    'http://xmlns.com/foaf/0.1/accountName',
//    	    'http://xmlns.com/foaf/0.1/nick',
//    	    'http://xmlns.com/foaf/0.1/surname',
   	    
//    	    'http://www.w3.org/2004/02/skos/core#altLabel'
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
	
	
    var ns = {};

		
	
	
	var conceptPathFinderApiUrl = 'http://localhost:8080/jassa/api/path-finding';

	
	var conceptWgs84 = new facete.Concept(sparql.ElementString.create('?s <http://www.w3.org/2003/01/geo/wgs84_pos#long> ?x ;  <http://www.w3.org/2003/01/geo/wgs84_pos#lat> ?y'), rdf.NodeFactory.createVar('s'));
	var conceptGeoVocab = new facete.Concept(sparql.ElementString.create('?s <http://geovocab.org/geometry#geometry> ?w'), rdf.NodeFactory.createVar('s'));

	var geoConcepts = [conceptWgs84, conceptGeoVocab];
	
	
	var mapParser = new sponate.MapParser();

	var vs = rdf.NodeFactory.createVar('s');
	var vx = rdf.NodeFactory.createVar('x');
	var vy = rdf.NodeFactory.createVar('y');
	var vw = rdf.NodeFactory.createVar('w');
	
	var wgs84GeoView = mapParser.parseMap({
		name: 'lonlat',
		template: [{
			id: conceptWgs84.getVar(), //'?s',
			lon: vx, // '?x',
			lat: vy, // '?y'
			wkt: function(b) { return 'POINT(' + b.get(vx) + ' ' + b.get(vy) + ')';}
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
	
	
    ns.GeoMapFactory = Class.create({
	    initialize: function(baseSponateView, bboxExprFactory) {
	        //this.template = template;
	        //this.baseElement = baseElement;
	        this.baseSponateView = baseSponateView;
	        this.bboxExprFactory = bboxExprFactory;
	    },

	    createMap: function(bounds) {
	        var baseSponateView = this.baseSponateView;
	        var bboxExprFactory = this.bboxExprFactory;
	        
	        var pattern = baseSponateView.getPattern();
		    var baseElementFactory = baseSponateView.getElementFactory();
		    
		    var baseElement = baseElementFactory.createElement();
			var element = this.baseBaseElement;	       
		    if(bounds) {
				var filterExpr = bboxExprFactory.createExpr(bounds);
				var filterElement = new sparql.ElementFilter(filterExpr);
		       
		       	element = new sparql.ElementGroup([baseElement, filterElement]);
		    }
		       
			var result = new sponate.Mapping(null, pattern, new sparql.ElementFactoryConst(element));
			return result;
		}
	});
	
	
    var wgs84MapFactory = new ns.GeoMapFactory(wgs84GeoView, new geo.BBoxExprFactoryWgs84(vx, vy));
	var ogcMapFactory = new ns.GeoMapFactory(ogcGeoView, new geo.BBoxExprFactoryWkt(vw));
    
	var bounds = {left: 0, bottom: 0, right: 10, top: 10};
	
	var tmp = wgs84MapFactory.createMap(bounds);
	/*
	var flow = sponateBuilder.create(startMap).
	
	*/
	
	console.log('geoLonLatView ' + tmp);

	
// 	alert(rdf.NodeFactory.parseRdfTerm('_:boo'));
// 	alert(rdf.NodeFactory.parseRdfTerm('<http://example.org>'));
// 	alert(rdf.NodeFactory.parseRdfTerm('"foo"'));
// 	alert(rdf.NodeFactory.parseRdfTerm('"bar"@en'));
// 	alert(rdf.NodeFactory.parseRdfTerm('"baz"^^<http://www.w3.org/2001/XMLSchema#string>'));
	//facete.test();
	
	//var sparqlEndpointUrl = 'http://localhost/sparql';
	//var sparqlEndpointUrl = 'http://cstadler.aksw.org/vos-freebase/sparql';	
	
// 	var sparqlEndpointUrl = 'http://dbpedia.org/sparql';
// 	var defaultGraphUris = ['http://dbpedia.org'];

// 	var sparqlEndpointUrl = 'http://fp7-pp.publicdata.eu/sparql';
// 	var defaultGraphUris = ['http://fp7-pp.publicdata.eu/'];
	
	var sparqlEndpointUrl = 'http://localhost/fts-sparql';
	//var defaultGraphUris = ['http://fts.publicdata.eu/'];
	var defaultGraphUris = ['http://fp7-pp.publicdata.eu/'];

 	
// 	var sparqlEndpointUrl = 'http://cstadler.aksw.org/conti/freebase/germany/sparql';
// 	var defaultGraphUris = ['http://freebase.com/2013-09-22/data/'];

//  	var sparqlEndpointUrl = 'http://cstadler.aksw.org/conti/freebase/world/sparql';
//  	var defaultGraphUris = ['http://freebase.com/2013-09-22/all'];

//  	var sparqlEndpointUrl = 'http://linkedgeodata.org/sparql';
//  	var defaultGraphUris = ['http://linkedgeodata.org'];

	var qef = new service.SparqlServiceHttp(sparqlEndpointUrl, defaultGraphUris);
	qef = new service.SparqlServiceCache(qef);
	
	/**
	 * Sponate (labels)
	 */
	var store = new sponate.StoreFacade(qef, prefixes);//, cacheFactory);

	var labelUtilFactory = new sponate.LabelUtilFactory(prefLabelPropertyUris, prefLangs);
		
 	// A label util can be created based on var names and holds an element and an aggregator factory.
 	var labelUtil = labelUtilFactory.createLabelUtil('o', 's', 'p');

	store.addMap({
		name: 'labels',
		template: [{
			id: '?s',
			displayLabel: labelUtil.getAggFactory(),
			hiddenLabels: [{id: '?o'}]
		}],
		from: labelUtil.getElement()
//		new sparql.ElementGroup([
//          new sparql.ElementString(sparql.SparqlString.create('?s a <http://dbpedia.org/ontology/Castle>')),
//            sparql.ElementString.create('Filter(?s = <http://dbpedia.org/resource/Citadel_of_Damascus>)'),
//            labelUtil.getElement()
//        ])
	});

	
	var labelStore = store.labels;

	/* 
	var pathToElement = function(path) {

	    var concept = fctService.createConceptFacetValues(path);			
		
		var baseConcept = configModel.get('concept');				
		var tmpConcept = hack.createConcept();

		
		var concept = baseConcept.combineWith(tmpConcept);

		var pathConstraintFactory = new facets.PathConstraintWgs84.Factory.create(geoPath);
		var geoConceptFactoryBase = new facets.GeoConceptFactory(rootFacetNode, pathConstraintFactory);
		
		
		var geoConceptFactory = new facets.GeoConceptFactoryCombine(concept, geoConceptFactoryBase);
			    
	};
	*/
	
// 	store.labels.find({hiddenLabels: {$elemMatch: {id: {$regex: 'mask'}}}}).limit(10).asList().done(function(items) {
	    
// 	});
	
	
	/**
	 * Facete
	 */
	var constraintManager = new facete.ConstraintManager();
	
	var baseVar = rdf.NodeFactory.createVar("s");
	var baseConcept = facete.ConceptUtils.createSubjectConcept(baseVar);
	//var sparqlStr = sparql.SparqlString.create("?s a ?t");
	//var baseConcept = new facete.Concept(new sparql.ElementString(sparqlStr));
	var rootFacetNode = facete.FacetNode.createRoot(baseVar);
	
	// Based on above objects, create a provider for the configuration
	// which the facet service can build upon
	var facetConfigProvider = new facete.FacetGeneratorConfigProviderIndirect(
		new facete.ConceptFactoryConst(baseConcept),
		new facete.FacetNodeFactoryConst(rootFacetNode),
		constraintManager
	);
	
	var fcgf = new facete.FacetConceptGeneratorFactoryImpl(facetConfigProvider);
	var facetConceptGenerator = fcgf.createFacetConceptGenerator();


	// The FacetStateProvider keeps track of limit and offsets for the nodes of the facet tree
	// By default, a limit of 10 is used
	var facetStateProvider = new facete.FacetStateProviderImpl(10);

	// A map from path to search string
	var pathToFilterString = new util.HashMap();
	
	var expansionSet = new util.HashSet();
	expansionSet.add(new facete.Path());
	
	//facetStateProvider.getMap().put(new facete.Path(), new facete.FacetStateImpl(true, null, null))
	
	var fctService = new facete.FacetServiceImpl(qef, facetConceptGenerator, labelStore);

	

	var fctTreeService = new facete.FacetTreeServiceImpl(fctService, expansionSet, facetStateProvider, pathToFilterString);


    var constraintTaggerFactory = new facete.ConstraintTaggerFactory(constraintManager);

    
    var favFacets = [facete.Path.parse('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), facete.Path.parse('http://www.w3.org/2002/07/owl#sameAs'), facete.Path.parse('http://ns.aksw.org/spatialHierarchy/isLocatedIn')]; 
    
    

    ns.flattenTree = function(node, childPropertyName, result) {
        if(result == null) {
            result = [];
        }
        
        if(node) {
            result.push(node);
        }
        
        var children = node[childPropertyName];
        if(children) {
            _(children).each(function(childNode) {
                ns.flattenTree(childNode, childPropertyName, result);
            });
        }
        
        return result;
    };

    
    ns.ConceptFactoryFacetService = Class.create(facete.ConceptFactory, {
        initialize: function(facetService) {
            this.facetService = facetService;
        },
        
        createConcept: function() {
            var result = facetService.createConceptFacetValues(new facete.Path());
            return result;
        }
    });
    
    
    


 
    
    var tableMod = new facete.FaceteTableMod(); 
    tableMod.togglePath(new facete.Path());
    

    /**
     * Interface for retrieval of tags for a given object
     *
     */
    ns.ItemTagger = Class.create({
        createTags: function(item) {
            throw 'Not overidden';
        } 
    });
    
    ns.ItemTaggerTablePath = Class.create(ns.ItemTagger, {
        initialize: function(tableMod) {
            this.tableMod = tableMod;
        },
        
        createTags: function(path) {
            var paths = this.tableMod.getPaths();
            var isContained = paths.contains(path);
            
            var result = { isContained: isContained };
            //console.log('table: ' + path, isContained);
            return result;
        }
    });

    
    ns.ItemTaggerFilterString = Class.create(ns.ItemTagger, {
        initialize: function(pathToFilterString) {
            this.pathToFilterString = pathToFilterString;
        },
        
        createTags: function(path) {
            var filterString = this.pathToFilterString.get(path);
            //var isContained = paths.contains(path);
            
            var result = { filterString: filterString };
            //console.log('table: ' + path, isContained);
            return result;
        }
    });


    ns.ItemTaggerManager = Class.create(ns.ItemTagger, {
       initialize: function() {
           this.taggerMap = {}
       },
       
       getTaggerMap: function() {
           return this.taggerMap;
       },
       
       /**
        * @param item The object for which to create the tags
        */
       createTags: function(item) {
           var result = {};
           _(this.taggerMap).each(function(tagger, key) {
               var tags = tagger.createTags(item);
               
               result[key] = tags;
           });
           
           return result;
       }
    });

    
    var pathTagger = new ns.ItemTaggerManager();
    pathTagger.getTaggerMap()['table'] = new ns.ItemTaggerTablePath(tableMod);
    pathTagger.getTaggerMap()['filter'] = new ns.ItemTaggerFilterString(pathToFilterString);
    
    ns.FacetTreeTagger = Class.create({
        initialize: function(itemTagger) {
            this.itemTagger = itemTagger;
        },
        
        applyTags: function(facetNode) {
            var itemTagger = this.itemTagger;
            
            var facetNodes = ns.flattenTree(facetNode, 'children');
            
            _(facetNodes).each(function(node) {
                var path = node.item.getPath();
                var tags = itemTagger.createTags(path);
                _(node).extend(tags);
                
                //console.log('tagging: ' + path, tags, node);
            });
        }
    });
    
    
    var facetTreeTagger = new ns.FacetTreeTagger(pathTagger);
    
    
	ns.FacetValueService = Class.create({
	    initialize: function(facetService, constraintTaggerFactory) {
	        this.facetService = facetService; 
	        this.constraintTaggerFactory = constraintTaggerFactory;
	    },
	   
	    fetchFacetValues: function(path) {
            var facetService = this.facetService;
            var constraintTaggerFactory = this.constraintTaggerFactory;


			var concept = facetService.createConceptFacetValues(path, true);
			var countVar = rdf.NodeFactory.createVar("_c_");
			var queryCount = facete.ConceptUtils.createQueryCount(concept, countVar);
			var qeCount = qef.createQueryExecution(queryCount);
			var countPromise = service.ServiceUtils.fetchInt(qeCount, countVar);
			
			var query = facete.ConceptUtils.createQueryList(concept);			
			
			

			
			var pageSize = 10;
			
			query.setLimit(pageSize);
			query.setOffset(($scope.currentPage - 1) * pageSize);
			
				var qe = qef.createQueryExecution(query);
			var dataPromise = service.ServiceUtils.fetchList(qe, concept.getVar()).pipe(function(nodes) {

			    var tagger = constraintTaggerFactory.createConstraintTagger(path);
			    
			    var r = _(nodes).map(function(node) {
			        var tmp = {
						path: path,
						node: node,
						tags: tagger.getTags(node)
			        };

			        return tmp;
			    });

			    return r;
			});
			
			var result = {
			    countPromise: countPromise,
			    dataPromise: dataPromise
			};
			
			return result;
	    }
	});

	
	


	/**
	 * Angular
	 */	
	var myModule = angular.module('FaceteDBpediaExample', ['ui.bootstrap']);

	
	myModule.directive('ssbMap', function($timeout, $parse) {
        //console.log('starting map');
        
	    return {
	        restrict: 'EA', // says that this directive is only for html elements
	        replace: false,        
	        template: '<div></div>', 
	        link: function (scope, element, attrs) {
	            // turn the button into a jQuery button
	            $timeout(function () {
	                console.log('rendering map');
	                /* set text from attribute of custom tag*/
	                //element.text(attrs.text).button();
	                var $el = jQuery(element).ssbMap();
	      	      	var widget = $el.data("custom-ssbMap");
	    	      
	    	      	// Extract the map
	    	      	var map = widget.map;
	                
	    	      	var parentScope = element.parent().scope();
	                
	    	      	parentScope.$watch('boxes', function(boxes) {
	    	      	    angular.forEach(boxes, function(bounds, id) {
	    	      	      	console.log('adbox', bounds, id);
	    	      	        widget.addBox(id, bounds);
	    	      	    });
						console.log('boxes', boxes);
	                });

	                var model = $parse(attrs.ssbMap);
	                console.log('model', model);
	                //Set scope variable for the map
	                if(model && !_(model).isFunction()) {
	                    model.assign(scope, map);
	                }
	                    
	            }, 10);/* very slight delay, even using "0" works*/
	        }
	    };
//         return function (scope, element, attr) {
//             jQuery(element).ssbMap();
//             scope.$watch(attr.ngVisible, function (visible) {
//                 element.css('visibility', visible ? 'visible' : 'hidden');
//             });
//         };
	});
	
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
	
	myModule.factory('facetService', function($rootScope, $q) {
		return {
			fetchFacets: function(startPath) {
				var promise = fctTreeService.fetchFacetTree(startPath);
				var result = sponate.angular.bridgePromise(promise, $q.defer(), $rootScope);
				return result;
			}
	   };
	});

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
	
	myModule.controller('ShowQueryCtrl', function($scope, facetService) {
	    $scope.updateQuery = function() {
		    var concept = fctService.createConceptFacetValues(new facete.Path());			
			var query = facete.ConceptUtils.createQueryList(concept);			

			$scope.queryString = query.toString();	        
	    };
	    
		$scope.$on("facete:constraintsChanged", function() {
			$scope.updateQuery();
		});
	});
	
	myModule.controller('ConstraintCtrl', function($scope, facetService, $rootScope) {
		$scope.$on('facete:refresh', function() {
		    $scope.refresh();
		});
	    
		$scope.refresh = function() {
		    $scope.refreshConstraints();
		};
		
	    $scope.refreshConstraints = function() {
	        var constraints = constraintManager.getConstraints();
	        
	        var items =_(constraints).map(function(constraint) {
				var r = {
					constraint: constraint,
					label: '' + constraint
				};
				
				return r;
	        });

	        $scope.constraints = items;
	    };
	    
	    $scope.removeConstraint = function(item) {
	        constraintManager.removeConstraint(item.constraint);
			$rootScope.$broadcast('facete:constraintsChanged');
	    };
	    
		$scope.$on("facete:constraintsChanged", function() {
			$scope.refreshConstraints();
		});
	});
	
	myModule.controller('MyCtrl2', function($scope, $q, $rootScope) {
		
	    $scope.filterText = '';
		$scope.totalItems = 64;
		$scope.currentPage = 1;
		$scope.maxSize = 5;
		
// 		$scope.firstText = '<<';
// 		$scope.previousText = '<';
// 		$scope.nextText = '>';
// 		$scope.lastText = '>>';

		$scope.toggleConstraint = function(item) {
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

			var path = $scope.path;
			if(path == null) {
				return;
			}

			var concept = fctService.createConceptFacetValues(path, true);
			
			var text = $scope.filterText;
			console.log('FilterText: ' + text);
			var criteria = {};
			if(text) {
			    criteria = {$or: [
			        {hiddenLabels: {$elemMatch: {id: {$regex: text, $options: 'i'}}}},
			        {id: {$regex: text, $options: 'i'}}
			    ]};
			}
			var baseFlow = store.labels.find(criteria).concept(concept, true);
			    

			var countPromise = baseFlow.count();
			
			var pageSize = 10;
	 		
			var dataFlow = baseFlow.skip(($scope.currentPage - 1) * pageSize).limit(pageSize);

			var dataPromise = dataFlow.asList().pipe(function(docs) {

			    var tagger = constraintTaggerFactory.createConstraintTagger(path);
			    
			    var r = _(docs).map(function(doc) {
			        // TODO Sponate must support retaining node objects
			        var node = rdf.NodeFactory.parseRdfTerm(doc.id);
			        
			        
			        var label = doc.displayLabel ? doc.displayLabel : doc.id;
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
			console.log("Change");
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
	myModule.controller('FaceteContextCtrl', function($scope) {

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
	    
	    var events = ['facete:facetSelected', 'facete:constraintsChanged', 'facete:refresh'];
	    
	    _(events).each(forwardEvent);
	    
	    /*
	    $scope.$on('facete:facetSelected', function(ev, path) {
	        if(ev.targetScope.$id != ev.currentScope.$id) {
	            $scope.$broadcast('facete:facetSelected', path);
	        }	        
	    });

	    $scope.$on('facete:constraintsChanged', function(ev, path) {
	        if(ev.targetScope.$id != ev.currentScope.$id) {
	            $scope.$broadcast('facete:constraintsChanged', path);
	        }	        
	    });
	    */
	});
				
	 
//      myModule.controller('ModalInstanceCtrl', function($scope) {
        
//      });
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
    
    
    myModule.controller('FacetTreeSearchCtrl', function($rootScope, $scope, $q, facetService) {
        $scope.items = [{name: 'foo'}];
        
		$scope.$watch('searchText', function(newValue) {
		    console.log('searchText: ', newValue);
		    if(!newValue || newValue == '') {
		        return;
		    }
		    
		    var conceptPathFinder = new client.ConceptPathFinderApi(conceptPathFinderApiUrl, sparqlEndpointUrl, defaultGraphUris);
		    
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
    
    
    myModule.controller('MapCtrl', function($scope) {
        $scope.boxes = {foo: {left: -10, bottom: -10, right: 10, top: 10}};
    });
    
	myModule.controller('MyCtrl', function($rootScope, $scope, facetService) {

		//$scope.maxSize = 5;

// 	    $rootScope.$on('facetSelected', function(path) {
// 			$rootScope.$broadcast('facetSelected', path);
// 	    });

		$scope.doFilter = function(path, filterString) {

		    pathToFilterString.put(path, filterString);
		    //alert(JSON.stringify(pathToFilterString));
// 		    var concept = ;
		    
// 		    var foo = store.labels.find({hiddenLabels: {$elemMatch: {id: {$regex: text}}}}).concept(concept, true);
		    
		    //console.log(text);
		    $scope.refresh();
		};

		$scope.$on('facete:constraintsChanged', function() {
		    $scope.refresh();
		});
	    
	    $scope.refresh = function() {
	        var facet = $scope.facet;
	        var startPath = facet ? facet.item.getPath() : new facete.Path();
	        
	        //console.log('scopefacets', $scope.facet);
			facetService.fetchFacets(startPath).then(function(data) {			    
			    facetTreeTagger.applyTags(data);
				$scope.facet = data;
			});
		};
		
// 		$scope.init = function() {
// 			$scope.refreshFacets();
// 		};
		
		$scope.toggleCollapsed = function(path) {
			util.CollectionUtils.toggleItem(expansionSet, path);
			
			$scope.refresh();
		};
		
		$scope.selectFacetPage = function(page, facet) {
			var path = facet.item.getPath();
            var state = facetStateProvider.getFacetState(path);
            var resultRange = state.getResultRange();
            
            console.log('Facet state for path ' + path + ': ' + state);
			var limit = resultRange.getLimit() || 0;
			
			var newOffset = limit ? (page - 1) * limit : null;
			
			resultRange.setOffset(newOffset);
			
			$scope.refresh();
		};
		
		$scope.toggleSelected = function(path) {
			//$rootScope.$broadcast("facetSelected", path);
		    $scope.$emit('facete:facetSelected', path);
		};
		
		$scope.toggleTableLink = function(path) {
			//$scope.emit('facete:toggleTableLink');
		    tableMod.togglePath(path);
		    
		    //$scope.$emit('')
		    //alert('yay' + JSON.stringify(tableMod.getPaths()));
		    
		    $scope.$emit('facete:refresh');
		    
// 		    var columnDefs = tableMod.getColumnDefs();
// 		    _(columnDefs).each(function(columnDef) {
		        
// 		    });
		    
// 		    tableMod.addColumnDef(null, new ns.ColumnDefPath(path));
		    //alert('yay ' + path);
		};
		
		$scope.$on('facete:refresh', function() {
		    $scope.refresh();
		});
	});
		
	</script>

	<script type="text/ng-template" id="facet-tree-item.html">
		<div ng-class="{'frame': facet.isExpanded}">
			<div class="facet-row" ng-class="{'highlite': facet.isExpanded}" ng-mouseover="facet.isHovered=true" ng-mouseleave="facet.isHovered=false">
				<a ng-show="facet.isExpanded" href="" ng-click="toggleCollapsed(facet.item.getPath())"><span class="glyphicon glyphicon-chevron-down"></span></a>
				<a ng-show="!facet.isExpanded" href="" ng-click="toggleCollapsed(facet.item.getPath())"><span class="glyphicon glyphicon-chevron-right"></span></a>
				<a data-rdf-term="{{facet.item.getNode().toString()}}" title="{{facet.item.getNode().getUri()}}" href="" ng-click="toggleSelected(facet.item.getPath())">{{facet.item.getNode().getUri()}}</a>


				<a ng-visible="facet.isHovered || facet.table.isContained" href="" ng-click="toggleTableLink(facet.item.getPath())"><span class="glyphicon glyphicon-list-alt"></span></a>

<!--				<ul>
                    <li ng-repeat="action in facet.actions"></li>
                </ul>
-->

				<span style="float: right" class="badge">{{facet.item.getDistinctValueCount()}}</span>	
			</div>
			<div ng-show="facet.isExpanded" style="width:100%"> 

<!-- ng-show="facet.pageCount > 1 || facet.children.length > 5" -->
                <div style="width:100%; background-color: #eeeeff;">
				    <div style="padding-right: 16px; padding-left: {{16 * (facet.item.getPath().getLength() + 1)}}px">
<form ng-submit="doFilter(facet.item.getPath(), facet.filter.filterString)">
						<div class="input-group">
                            <input type="text" class="form-control" placeholder="Filter" ng-model="facet.filter.filterString" value="{{facet.filter.filterString}}" />
                            <span class="input-group-btn">
                                <button type="submit" class="btn btn-default">Filter</button>
                            </span>
						</div>			    	    
</form>
				    </div>
                </div>

                <div ng-show="facet.pageCount != 1" style="width:100%; background-color: #eeeeff">
    		         <pagination style="padding-left: {{16 * (facet.item.getPath().getLength() + 1)}}px" class="pagination-mini" max-size="7" total-items="facet.childFacetCount" page="facet.pageIndex" boundary-links="true" rotate="false" on-select-page="selectFacetPage(page, facet)" first-text="<<" previous-text="<" next-text=">" last-text=">>"></pagination>
                </div>

			    <span ng-show="facet.children.length == 0" style="color: #aaaaaa; padding-left: {{16 * (facet.item.getPath().getLength() + 1)}}px">(no entries)</span>

 			    <div style="padding-left: {{16 * (facet.item.getPath().getLength() + 1)}}px" ng-repeat="facet in facet.children" ng-include="'facet-tree-item.html'"></div>
           </div>
		</div>
	</script>

	<script type="text/ng-template" id="result-set-browser.html">
		<div class="frame">
			<form ng-submit="filterTable(filterText)">
			    <input type="text" ng-model="filterText" />
				<input class="btn-primary" type="submit" value="Filter" />
			</form>
			<table>
                <tr><th>Value</th><th>Count</th><th>Constrained</th></tr>
			    <tr ng-repeat="item in facetValues">
                    <td>{{item.displayLabel}}</td>
                    <td>todo</td>
                    <td><input type="checkbox" ng-model="item.tags.isConstrainedEqual" ng-change="toggleConstraint(item)"</td>
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

    <table class="layout-table">
        <colgroup>
            <col width="30%" />
            <col width="70%" />
        </colgroup>
		<tr>
		    <td>
	
				<h3>FavFacets</h3>
				<div portletheading>
				    This is a test
				</div>
				
				
			    <div ng-controller="FavFacetsCtrl" data-ng-init="refresh()">
			        <span ng-show="favFacets.length == 0">No favourited facets</span> 
			        <ul ng-repeat="facet in favFacets">
						<li ng-controller="MyCtrl"><div ng-include="'facet-tree-item.html'"></div></li>
					</ul>
			    </div>
			
				<h3>FacetTree</h3>
				<div ng-controller="MyCtrl" data-ng-init="refresh()">
					<div ng-include="'facet-tree-item.html'"></div>
				</div>
			
				<div ng-controller="MyCtrl2">
					<div ng-include="'result-set-browser.html'"></div>	
				</div>
				
				<div ng-controller="ConstraintCtrl" data-ng-init="refreshConstraints()">
				    <span ng-show="constraints.length == 0" style="color: #aaaaaa;">(no constraints)</span>
					<ul>
					    <li ng-repeat="constraint in constraints"><a href="" ng-click="removeConstraint(constraint)">{{constraint}}</a></li>
					</ul>
				</div>
				
				<div ng-controller="ShowQueryCtrl" data-ng-init="updateQuery()">
					<span>Query = {{queryString}}</span>	
				</div>
	
	        </td>
	
	        <td style="vertical-align: top">
	        	<div ng-controller="FacetTreeSearchCtrl">
	        		<input type="search" ng-model="searchText" /><button>Search</button>
	        		<ul>
	        			<li ng-repeat="item in items">{{item.name}} --- {{item.geoConcept}}</li>
	        		</ul>
	        	</div>
	        
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
	        </td>        
	    </tr>
    </table>
    
    <div ng-controller="MapCtrl">
		<div ssb-map style="width: 500px; height: 300px;"></div>
	</div>	        
    
</body>

</html>
