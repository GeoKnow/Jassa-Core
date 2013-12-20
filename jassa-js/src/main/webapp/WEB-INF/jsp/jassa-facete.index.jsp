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
	
	//var sparqlEndpointUrl = 'http://localhost/sparql';
	//var sparqlEndpointUrl = 'http://cstadler.aksw.org/vos-freebase/sparql';	
	
// 	var sparqlEndpointUrl = 'http://dbpedia.org/sparql';
// 	var defaultGraphUris = ['http://dbpedia.org'];

// 	var sparqlEndpointUrl = 'http://fp7-pp.publicdata.eu/sparql';
// 	var defaultGraphUris = ['http://fp7-pp.publicdata.eu/'];
	
 	var sparqlEndpointUrl = 'http://localhost/fts-sparql';
 	var defaultGraphUris = ['http://fts.publicdata.eu/'];

	var qef = new service.SparqlServiceHttp(sparqlEndpointUrl, defaultGraphUris);
	qef = new service.SparqlServiceCache(qef);
	
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

	var expansionSet = new util.HashSet();
	expansionSet.add(new facete.Path());
	
	//facetStateProvider.getMap().put(new facete.Path(), new facete.FacetStateImpl(true, null, null))
	
	var fctService = new facete.FacetServiceImpl(qef, facetConceptGenerator);

	
	var fctTreeService = new facete.FacetTreeServiceImpl(fctService, expansionSet, facetStateProvider);
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

    var ns = {};
	 
    ns.ConstraintTaggerFactory = Class.create({
        initialize: function(constraintManager) {
			this.constraintManager = constraintManager;
        },
        
        createConstraintTagger: function(path) {
			var constraints = this.constraintManager.getConstraintsByPath(path);
			
			var equalConstraints = {};

			_(constraints).each(function(constraint) {
			    var constraintType = constraint.getName();
			     
			    if(constraintType == 'equal') {
					var node = constraint.getValue();
			        equalConstraints[node.toString()] = node;
			    }
			});
	
			console.log('eqConstraints: ', equalConstraints);
			var result = new ns.ConstraintTagger(equalConstraints);
			return result;
        }
    });
	 
    ns.ConstraintTagger = Class.create({
		initialize: function(equalConstraints) {
			this.equalConstraints = equalConstraints;
		},
        
        getTags: function(node) {
			var result = {
			    isConstrainedEqual: this.equalConstraints[node.toString()] ? true : false
			};
			
			return result;
        }
    }); 

    var constraintTaggerFactory = new ns.ConstraintTaggerFactory(constraintManager);

	
	var myModule = angular.module('FaceteDBpediaExample', ['ui.bootstrap']);

	
	myModule.factory('facetService', function($rootScope, $q) {
		return {
			fetchFacets: function() {
				var promise = fctTreeService.fetchFacetTree(facete.Path.parse(""));
				var result = sponate.angular.bridgePromise(promise, $q.defer(), $rootScope);
				return result;
			}
	   };
	});

	myModule.controller('ShowQueryCtrl', function($scope, facetService) {
	    $scope.updateQuery = function() {
		    var concept = fctService.createConceptFacetValues(new facete.Path());			
			var query = facete.ConceptUtils.createQueryList(concept);			
console.log('Query', query);
			$scope.queryString = query.toString();	        
	    };
	    
		$scope.$on("constraintsChanged", function() {
			$scope.updateQuery();
		});
	});
	
	myModule.controller('ConstraintCtrl', function($scope, facetService, $rootScope) {
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
			$rootScope.$broadcast('constraintsChanged');
	    };
	    
		$scope.$on("constraintsChanged", function() {
			$scope.refreshConstraints();
		});
	});
	
	myModule.controller('MyCtrl2', function($scope, $q, $rootScope) {
		
		$scope.totalItems = 64;
		$scope.currentPage = 1;
		$scope.maxSize = 5;

		$scope.toggleConstraint = function(item) {
//			alert('toggle: ' + JSON.stringify(item));
			var constraint = new facete.ConstraintSpecPathValue(
					'equal',
					item.path,
					item.node);

			var hack = constraintManager.removeConstraint(constraint);
			if(!hack) {
				constraintManager.addConstraint(constraint);
			}

			$rootScope.$broadcast('constraintsChanged');
		};
		
		var updateItems = function() {
			//console.log("Update");

			var path = $scope.path;
			if(path == null) {
				return;
			}

			var concept = fctService.createConceptFacetValues(path, true);
			var countVar = rdf.NodeFactory.createVar("_c_");
			var queryCount = facete.ConceptUtils.createQueryCount(concept, countVar);
 			var qeCount = qef.createQueryExecution(queryCount);
			var countPromise = service.ServiceUtils.fetchInt(qeCount, countVar);
			
			var query = facete.ConceptUtils.createQueryList(concept);			
			
			var pageSize = 10;
			
			query.setLimit(pageSize);
			query.setOffset(($scope.currentPage - 1)* pageSize)
			
 			var qe = qef.createQueryExecution(query);
			var dataPromise = service.ServiceUtils.fetchList(qe, concept.getVar()).pipe(function(nodes) {
			    //return nodes.map(function(x) { return x.toString(); });

			    var tagger = constraintTaggerFactory.createConstraintTagger(path);
			    
			    var r = _(nodes).map(function(node) {
			        var tmp = {
						path: path,
						node: node,
						tags: tagger.getTags(node)
			        };

			        return tmp;
			    });
			    
			    //console.log('meh', r);
			    return r;
			});			

			//var promises = [countPromise, dataPromise];

			/*
			$.when.apply(window, promises).done(function(count, items) {
			    return {
			        count: count,
			        items: items
			    };
			});
			*/

			sponate.angular.bridgePromise(countPromise, $q.defer(), $rootScope).then(function(count) {
			    $scope.totalItems = count; 
			});
			
			sponate.angular.bridgePromise(dataPromise, $q.defer(), $rootScope).then(function(items) {
			    $scope.facetValues = items;
			});

		};


//		constraintManager.addConstraint(new facete.ConstraintSpecPathValue(
//		'equal',
//		facete.Path.parse('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
//		sparql.NodeValue.makeNode(rdf.NodeFactory.createUri('http://www.w3.org/2002/07/owl#Class'))
//	));

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
		
		$scope.$on('constraintsChanged', function() {
		    updateItems(); 
		});
	});
				
				
	myModule.controller('MyCtrl', function($rootScope, $scope, facetService) {

	    $scope.Math = window.Math;

		$scope.$on('constraintsChanged', function() {
		    $scope.refreshFacets();
		});
	    
	    $scope.refreshFacets = function() {
			//$scope.facet = facetService.fetchFacets();
			facetService.fetchFacets().then(function(data) {
			    
			    console.log('refreshed data: ', data);
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
		
		$scope.selectFacetPage = function(page, facet) {
			//alert(page + " " + JSON.stringify(facet));
			
			//facet.childFacetCount
			var path = facet.item.getPath();
            var state = facetStateProvider.getFacetState(path);
            var resultRange = state.getResultRange();
            
            console.log('Facet state for path ' + path + ': ' + state);
			var limit = resultRange.getLimit() || 0;
			
			var newOffset = limit ? (page - 1) * limit : null;
			
			resultRange.setOffset(newOffset);
			
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
				<a data-rdf-term="{{facet.item.getNode().toString()}}" title="{{facet.item.getNode().getUri()}}" href="" ng-click="toggleSelected(facet.item.getPath())">{{facet.item.getNode().getUri()}}</a>
				<span style="float: right" class="badge">{{facet.item.getDistinctValueCount()}}</span>	
			</div>
			<div ng-show="facet.isExpanded" style="width:100%"> 

                <div ng-show="facet.pageCount != 1" style="width:100%; background-color: #fafafa;">
    		         <pagination style="margin-top: 5px; margin-bottom: 5px; padding-left: {{16 * (facet.item.getPath().getLength() + 1)}}px" class="pagination-small" max-size="10" total-items="facet.childFacetCount" page="facet.pageIndex" boundary-links="true" rotate="false" on-select-page="selectFacetPage(page, facet)"></pagination>
                </div>
			    <span ng-show="facet.children.length == 0" style="color: #aaaaaa; padding-left: {{16 * (facet.item.getPath().getLength() + 1)}}px">(no entries)</span>

 			    <div style="padding-left: {{16 * (facet.item.getPath().getLength() + 1)}}px" ng-repeat="facet in facet.children" ng-include="'facet-tree-item.html'"></div>
           </div>
		</div>
	</script>
<!-- 				<span>cfc: {{facet.childFacetCcount}} pageIndex: {{facet.pageIndex}}</span> -->
<!-- 			<span>{{facet.item.getPath()}}</span> -->
<!-- 			<span>{{console.log(JSON.stringify(facet))}}</span> -->
<!-- 			<span ng-show="{{facet.isExpanded}}">Pages: {{facet.childFacetCount / facet.limit}}, Current page: {{facet.offset / facet.childFacetCount + 1}}</span> -->

	<script type="text/ng-template" id="result-set-browser.html">
		<div class="frame">
			<form ng-submit="filterTable()">
			    <input type="text" ng-model="filterText" />
				<input class="btn-primary" type="submit" value="Filter" />
			</form>
			<table>
                <tr><th>Value</th><th>Count</th><th>Constrained</th></tr>
			    <tr ng-repeat="item in facetValues">
                    <td>{{item.node.toString()}}</td>
                    <td>todo</td>
                    <td><input type="checkbox" ng-model="item.tags.isConstrainedEqual" ng-change="toggleConstraint(item)"</td>
                </tr>
        	</table>
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
	
	<div ng-controller="ConstraintCtrl" data-ng-init="refreshConstraints()">
	    <span ng-show="constraints.length == 0" style="color: #aaaaaa;">(no constraints)</span>
		<ul>
		    <li ng-repeat="constraint in constraints"><a href="" ng-click="removeConstraint(constraint)">{{constraint}}</a></li>
		</ul>
	</div>
	
	<div ng-controller="ShowQueryCtrl" data-ng-init="updateQuery()">
		<span>Query = {{queryString}}</span>	
	</div>
	
</body>

</html>
