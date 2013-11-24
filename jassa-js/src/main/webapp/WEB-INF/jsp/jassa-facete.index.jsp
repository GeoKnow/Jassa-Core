<!DOCTYPE html>
<html ng-app="FaceteDBpediaExample">

<head>
	<meta content="text/html; charset=utf-8" http-equiv="Content-Type">
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />

	<title>Facete Example: DBpedia</title>
	<link rel="stylesheet" href="resources/libs/twitter-bootstrap/3.0.1/css/bootstrap.min.css" />
	
	${cssIncludes}
	
	<style media="screen" type="text/css">
	.image {
 	    max-width: 144px;
 	    max-height: 144px;
	    vertical-align: middle;
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
	</style>
	
	
	
	<script src="resources/libs/jquery/1.9.1/jquery.js"></script>
	<script src="resources/libs/twitter-bootstrap/3.0.1/js/bootstrap.js"></script>
	
	<script src="resources/libs/underscore/1.4.4/underscore.js"></script>
	<script src="resources/libs/underscore.string/2.3.0/underscore.string.js"></script>
	<script src="resources/libs/prototype/1.7.1/prototype.js"></script>
	<script src="resources/libs/angularjs/1.0.8/angular.js"></script>
	

	${jsIncludes}

	<script src="resources/js/facete/facete-playground.js"></script>

	
	<script type="text/javascript">
	_.mixin(_.str.exports());

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
	
	var facete = Jassa.facete;
	
	
	//facete.test();
	
	var qef = new service.QueryExecutionFactoryHttp("http://localhost/sparql", []);

	/**
	 * Facete
	 */
	var constraintManager = new facete.ConstraintManager();
	
	var baseVar = rdf.NodeFactory.createVar("s");
	var baseConcept = facete.ConceptUtils.createSubjectConcept(baseVar);
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


	//  
	var facetStateProvider = new facete.FacetStateProviderImpl();		

	facetStateProvider.getMap().put(new facete.Path(), new facete.FacetStateImpl(true, null, null))
	
	var fctService = new facete.FacetServiceImpl(qef, facetConceptGenerator); //, facetStateProvider);

	
	var fctTreeService = new facete.FacetTreeServiceImpl(fctService, facetStateProvider);
	/**
	fctService.setExpanded(path);
	fctService.
	**/
	
	
	
// 	facetService.fetchFacets(facete.Path.parse("")).done(function(list) {
		
// 		//alert(JSON.stringify(list));
		
// 		_(list).each(function(item) {
// 			console.log("FacetItem: " + JSON.stringify(item));
// 		});
	
	/**
	 * Angular
	 */
	
	
	var myModule = angular.module('FaceteDBpediaExample', []);

	
	myModule.factory('facetService', function($rootScope, $q) {
		return {
			fetchFacets: function() {
				//var promise = fctService.fetchFacets(facete.Path.parse("")).pipe(function(items) {
				var promise = fctTreeService.fetchFacetTree(facete.Path.parse("")).pipe(function(items) {
					var rootItem = new facete.FacetItem(new facete.Path(), rdf.NodeFactory.createUri("http://example.org/root"), null);
					
					return {
						item: rootItem,
						state: new facete.FacetStateImpl(true, null, null),
						children: items
					};
				});

				var result = sponate.angular.bridgePromise(promise, $q.defer(), $rootScope);
				
// 				result.then(function(foo) {
// 					console.log("foo: ", foo);
// 				});

				return result;
			}
	   };
	});

	myModule.controller('MyCtrl', function($scope, facetService) {
		$scope.filterTable = function() {
			$scope.facet = facetService.fetchFacets();
		};
		
		$scope.init = function() {
			$scope.filterTable();
		};
	});
		
	</script>

	<script type="text/ng-template" id="facet-tree-item.html">
		<div>
			<div class="facet-row" ng-class="{'mui-selected': facet.selected==true}">
				<a ng-show="facet.state.isExpanded()" href="" ng-click="facet.toggleCollapsed()"><span class="glyphicon glyphicon-chevron-down"></span></a>
				<a ng-show="!facet.state.isExpanded()" href="" ng-click="facet.toggleCollapsed()"><span class="glyphicon glyphicon-chevron-right"></span></a>
				<a title="{{facet.item.getNode().getUri()}}" href="" ng-click="facet.toggleSelected()">{{facet.item.getNode().getUri()}}</a>
				<span class="label label-info">{{facet.item.getDistinctValueCount()}}</span>	
			</div>
		
 			<div style="padding-left: {{12 * (facet.item.getPath().getLength() + 1)}}px" ng-repeat="facet in facet.children" ng-include="'facet-tree-item.html'"></li>
		</div>
	</script>

</head>

<body ng-controller="MyCtrl" data-ng-init="init()">

	<div ng-include="'facet-tree-item.html'">
	</div>

</body>

</html>
