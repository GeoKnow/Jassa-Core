<!DOCTYPE html>
<html ng-app="FaceteDBpediaExample">

<head>
	<meta content="text/html; charset=utf-8" http-equiv="Content-Type">
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />

	<title>Facete Example: DBpedia</title>
	<link rel="stylesheet" href="resources/libs/twitter-bootstrap/3.0.1/css/bootstrap.min.css" />
	<link rel="stylesheet" href="resources/libs/twitter-bootstrap/2.3.2/css/bootstrap.min.css" />
	
	${cssIncludes}
	
	<style media="screen" type="text/css">
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

<!-- 	<script src="resources/libs/angularjs/1.0.8/angular.js"></script> -->
<!-- 	<script src="resources/libs/angularjs/1.2.0-rc.2/angular.js"></script>	 -->
	<script src="resources/libs/angularjs/1.2.0-rc.3/angular.js"></script>	
	<script src="resources/libs/angular-ui/0.6.0/ui-bootstrap-tpls-0.6.0.js"></script>
	<script src="resources/libs/ui-router/0.2.0/angular-ui-router.js"></script>


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
	var util = Jassa.util;
	
	var facete = Jassa.facete;
	
// 	alert(rdf.NodeFactory.parseRdfTerm('_:boo'));
// 	alert(rdf.NodeFactory.parseRdfTerm('<http://example.org>'));
// 	alert(rdf.NodeFactory.parseRdfTerm('"foo"'));
// 	alert(rdf.NodeFactory.parseRdfTerm('"bar"@en'));
// 	alert(rdf.NodeFactory.parseRdfTerm('"baz"^^<http://www.w3.org/2001/XMLSchema#string>'));
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
	//var facetStateProvider = new facete.FacetStateProviderImpl();		

	var expansionSet = new util.HashSet();
	expansionSet.add(new facete.Path());
	
	//facetStateProvider.getMap().put(new facete.Path(), new facete.FacetStateImpl(true, null, null))
	
	var fctService = new facete.FacetServiceImpl(qef, facetConceptGenerator); //, facetStateProvider);

	
	var fctTreeService = new facete.FacetTreeServiceImpl(fctService, expansionSet);
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
	
	
	var myModule = angular.module('FaceteDBpediaExample', ['ui.bootstrap']);

	
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

	myModule.controller('MyCtrl2', function($scope) {
		
		$scope.totalItems = 64;
		$scope.currentPage = 1;
		$scope.maxSize = 5;
		
		var updateItems = function() {
			console.log("Update");

			var path = $scope.path;
			if(path == null) {
				return;
			}

			var concept = fctService.createConceptFacetValues(path);
			var countVar = rdf.NodeFactory.createVar("_c_");
			var queryCount = facete.ConceptUtils.createQueryCount(concept, countVar);
 			var qeCount = qef.createQueryExecution(queryCount);
			var promise = service.ServiceUtils.fetchInt(qeCount, countVar);
			promise.done(function(count) {
				$scope.totalItems = count;

				var query = facete.ConceptUtils.createQueryList(concept);			
				
				var pageSize = 10;
				
				query.setLimit(pageSize);
				query.setOffset(($scope.currentPage - 1)* pageSize)
				
	 			var qe = qef.createQueryExecution(query);
				var promise = service.ServiceUtils.fetchList(qe, concept.getVar());
				
				promise.done(function(items) {
					//console.log("items: ", items);

					
					$scope.facetValues = items;
					$scope.$apply();
				});
				
			});
			

		};


		$scope.$watch('currentPage', function() {			
			console.log("Change");
			updateItems();
		});

// 		$scope.$watchCollection('[currentPage, maxSize]', function() {
// 			updateItems();
// 		});
		
		$scope.$on("facetSelected", function(ev, path) {

			$scope.currentPage = 1;
			$scope.path = path;
			
			updateItems();
		});
		
		
	});
				
				
	myModule.controller('MyCtrl', function($rootScope, $scope, facetService) {
		$scope.refreshFacets = function() {
			//$scope.facet = facetService.fetchFacets();
			facetService.fetchFacets().then(function(data) {
				$scope.facet = data;
				//$scope.$apply();
			});
		};
		
		$scope.init = function() {
			$scope.refreshFacets();
		};
		
		$scope.toggleCollapsed = function(path) {
			util.CollectionUtils.toggleItem(expansionSet, path);
			
			console.log("ExpansionSet: " + expansionSet);
			
			//facetStateProvider.getMap().put(path, new facete.FacetStateImpl(true, null, null));			
			$scope.refreshFacets();
		};
		
		
		$scope.toggleSelected = function(path) {

			$rootScope.$broadcast("facetSelected", path);
						
// 			qe.execSelect().done(function(rs) {
// 				while(rs.hasNext()) {
// 					var binding = rs.nextBinding();
					
// 				}
// 			});
			
			//alert("test");
		};
	});
		
	</script>

	<script type="text/ng-template" id="facet-tree-item.html">
		<div ng-class="{'frame': facet.isExpanded}">
			<div class="facet-row" ng-class="{'highlite': facet.isExpanded}">
				<a ng-show="facet.isExpanded" href="" ng-click="toggleCollapsed(facet.item.getPath())"><span class="glyphicon glyphicon-chevron-down"></span></a>
				<a ng-show="!facet.isExpanded" href="" ng-click="toggleCollapsed(facet.item.getPath())"><span class="glyphicon glyphicon-chevron-right"></span></a>
				<a title="{{facet.item.getNode().getUri()}}" href="" ng-click="toggleSelected(facet.item.getPath())">{{facet.item.getNode().getUri()}}</a>
				<span style="float: right" class="badge">{{facet.item.getDistinctValueCount()}}</span>	
			</div>

			<span ng-show="facet.isExpanded && facet.children.length == 0" style="color: #aaaaaa; padding-left: {{16 * (facet.item.getPath().getLength() + 1)}}px">(no entries)</span>
 			<div style="padding-left: {{16 * (facet.item.getPath().getLength() + 1)}}px" ng-repeat="facet in facet.children" ng-include="'facet-tree-item.html'"></li>
		</div>
	</script>

	<script type="text/ng-template" id="result-set-browser.html">
		<div class="frame">
			<form ng-submit="filterTable()">
			    <input type="text" ng-model="filterText" />
				<input class="btn-primary" type="submit" value="Filter" />
			</form>
			<ul>
			    <li ng-repeat="item in facetValues">{{item.toString()}}</li>
        	</ul>
    		<pagination class="pagination-small" total-items="totalItems" page="$parent.currentPage" max-size="maxSize" boundary-links="true" rotate="false" num-pages="numPages"></pagination>
		</div>
	</script>
</head>

<body>

	<div ng-controller="MyCtrl" data-ng-init="init()">
		<div style="width: 30%">
			<div ng-include="'facet-tree-item.html'"></div>
		</div>
	</div>

	<div ng-controller="MyCtrl2">
		<div ng-include="'result-set-browser.html'"></div>	
	</div>
</body>

</html>
