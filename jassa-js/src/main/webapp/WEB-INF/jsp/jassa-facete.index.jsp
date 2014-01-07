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

 	
// 	var sparqlEndpointUrl = 'http://cstadler.aksw.org/conti/freebase/germany/sparql';
// 	var defaultGraphUris = ['http://freebase.com/2013-09-22/data/'];

//  	var sparqlEndpointUrl = 'http://cstadler.aksw.org/conti/freebase/world/sparql';
//  	var defaultGraphUris = ['http://freebase.com/2013-09-22/all'];

//  	var sparqlEndpointUrl = 'http://linkedgeodata.org/sparql';
//  	var defaultGraphUris = ['http://linkedgeodata.org'];

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


    var constraintTaggerFactory = new facete.ConstraintTaggerFactory(constraintManager);

    
    var favFacets = [facete.Path.parse('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), facete.Path.parse('http://www.w3.org/2002/07/owl#sameAs'), facete.Path.parse('http://ns.aksw.org/spatialHierarchy/isLocatedIn')]; 
    
    var ns = {};
    


    /**
     * Converts a Table Definition to a SPARQL graph pattern
     *
     * TODO Sort out some base class
     */
    ns.TableToElement2 = Class.create({
        initialize: function(baseFacetNode) {
            this.baseFacetNode = baseFacetNode;
            //this.filterManagerFactory = filterManagerFactory;
        },

        /**
         * Transforms the tableDef into a SPARQL element
         *
         * Post process whether optional elements are actually mandatory
         * Cross checks with the constraintManager of whether the
         * (sub-)elements are optional or mandatory
         *
         *
         */
        transform: function(tableDef) {
            var baseFacetNode = this.baseFacetNode;
            var columnDefs = tableDef.getColumnDefs();
            
            //var filterManager = this.filterManagerFactory.createConstraintManager();
            
            
            var elements = _(columnDefs).map(function(cd) {
                var isCdp = cd instanceof ns.ColumnDefPath;
                
                if(!isCdp) {
                    console.log('[ERROR] Unknown column definition type');
                    throw 'Bailing out';
                }
                
                var path = cd.getPath();
                
                var facetNode = baseFacetNode.forPath(path);
                var r = facetNode.getElements();

                //var r = transformCdp(cd);
				return r;
            });
            
            // For each column, collect the triple patterns that correspond to the paths
        }
    });
    

    ns.TableDef = Class.create({
        initialize: function() {
            this.paths = new util.ArrayList();
            //this.colNameToIndex = {};
        },

        getPaths: function() {
            return this.paths;
        },
        
        togglePath: function(path) {
            util.CollectionUtils.toggleItem(this.paths, path);
        }
    });
    

    /**
     * 
     *
     */
    ns.TableDef2 = Class.create({
        initialize: function() {
        	this.columnDefs = [];
		},
        
        getColumnDefs: function() {
            return this.columnDefs;
        },
        
        addColumnDef: function(columnDef) {
            this.columnDefs.push(columnDef);
        }        
    });

    
    var tableDef = new ns.TableDef(); 
    tableDef.togglePath(new facete.Path());
    
    /**
     * A column definition at least has a name.
     * Subclasses provide additional information about how the column is defined.
     * 
     * TODO The column name is rather an id instead of a name.
     */
    ns.ColumnDefBase = Class.create({
        initialize: function(columnName) {
            this.columnName = columnName;
        },
        
        getColumnName: function() {
            return this.columnName;
        }
    });
    
    /**
     * A column definition links the data that corresponds to a path to a single column
     * and associates it with a name.
     * 
     */
    ns.ColumnDefPath = Class.create(ns.ColumnDefBase, {
		/*
		 * @param columnName The name of the column
     	 * @param path The path which to link to the column     
     	 * @param useProperty false: Use the path's target's values. If true: refer to the paths child properties instead. 
     	 */
		initialize: function($super, columnName, path, useProperty) {
            $super(columnName);
            this.path = path;
            this.useProperty = useProperty;
        },
        
        getPath: function() {
            return this.path;
        },
        
        useProperty: function() {
            return this.useProperty;
        }
    });

    
    

	/**
	 * Angular
	 */	
	var myModule = angular.module('FaceteDBpediaExample', ['ui.bootstrap']);
	
	
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
		$scope.$on('facete:constraintsChanged', function() {
		    $scope.refresh();
		});
	    
	    $scope.refresh = function() {
	        var promise = fctTreeService.fetchFavFacets(favFacets);
	        sponate.angular.bridgePromise(promise, $q.defer(), $rootScope).then(function(items) {
			    console.log('refreshed favFacets: ', items);
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
		
		$scope.totalItems = 64;
		$scope.currentPage = 1;
		$scope.maxSize = 5;

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

			sponate.angular.bridgePromise(countPromise, $q.defer(), $rootScope).then(function(count) {
			    $scope.totalItems = count; 
			});
			
			sponate.angular.bridgePromise(dataPromise, $q.defer(), $rootScope).then(function(items) {
			    $scope.facetValues = items;
			});

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
	        //tableDef = 
	    };
	});
	
	/**
	 * Broadcasts facete related events down again; essenntially
	 * used so that sibling elements can react to the events.
	 *
	 */
	myModule.controller('FaceteContextCtrl', function($scope) {
	    
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
        $scope.columns = [{
            isRemoveable: true,
            isConfigureable: true,
            isSortable: true,
            
            displayName: 'test',
            
            sortDirection: 0
        }];
        
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
        
        $scope.sortColumn = function(index, sortDirection, isShiftPressed) {
            var column = $scope.columns[index];
            var currentSortDir = column.sortDirection;

            if(currentSortDir == column.sortDirection) {
                column.sortDirection = sortDirection;
            } else {
                column.sortDirection = sortDirection;
            }
                        
            //= sortDirection
        };
        
        
    });
	 
    
    /**
     * Custom directive for visibility
     * Source: https://gist.github.com/c0bra/5859295
     */
    myModule.directive('ngVisible', function () {
        return function (scope, element, attr) {
            scope.$watch(attr.ngVisible, function (visible) {
                element.css('visibility', visible ? 'visible' : 'hidden');
            });
        };
    });
    
	myModule.controller('MyCtrl', function($rootScope, $scope, facetService) {

// 	    $rootScope.$on('facetSelected', function(path) {
// 			$rootScope.$broadcast('facetSelected', path);
// 	    });

		$scope.$on('facete:constraintsChanged', function() {
		    $scope.refresh();
		});
	    
	    $scope.refresh = function() {
	        var facet = $scope.facet;
	        var startPath = facet ? facet.item.getPath() : new facete.Path();
	        
	        //console.log('scopefacets', $scope.facet);
			facetService.fetchFacets(startPath).then(function(data) {
			    console.log('refreshed data: ', data);
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

		    tableDef.togglePath(path);
		    alert('yay' + JSON.stringify(tableDef.getPaths()));
		    
// 		    var columnDefs = tableDef.getColumnDefs();
// 		    _(columnDefs).each(function(columnDef) {
		        
// 		    });
		    
// 		    tableDef.addColumnDef(null, new ns.ColumnDefPath(path));
		    //alert('yay ' + path);
		};
	});
		
	</script>

	<script type="text/ng-template" id="facet-tree-item.html">
		<div ng-class="{'frame': facet.isExpanded}">
			<div class="facet-row" ng-class="{'highlite': facet.isExpanded}">
				<a ng-show="facet.isExpanded" href="" ng-click="toggleCollapsed(facet.item.getPath())"><span class="glyphicon glyphicon-chevron-down"></span></a>
				<a ng-show="!facet.isExpanded" href="" ng-click="toggleCollapsed(facet.item.getPath())"><span class="glyphicon glyphicon-chevron-right"></span></a>
				<a data-rdf-term="{{facet.item.getNode().toString()}}" title="{{facet.item.getNode().getUri()}}" href="" ng-click="toggleSelected(facet.item.getPath())">{{facet.item.getNode().getUri()}}</a>


				<a href="" ng-click="toggleTableLink(facet.item.getPath())"><span class="glyphicon glyphicon-list-alt"></span></a>

<!--				<ul>
                    <li ng-repeat="action in facet.actions"></li>
                </ul>
-->

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
	
	
	<div ng-controller="CreateTableCtrl" data-ng-init="refresh()">
	    <table>
		    <tr><th ng-repeat="column in columns">
			
			    <a href="" ng-click="removeColumn($index)"><span ng-show="column.isRemoveable" class="glyphicon glyphicon-remove-circle"></span></a>
			    {{column.displayName}}
			    <a href="" ng-click="configureColumn($index)"><span ng-show="column.isConfigureable" class="glyphicon glyphicon-edit"></span></a>

				<a href="" ng-visible="column.isSortable && column.sortDirection >= 0" ui-keydown="{shift: 'shiftPressed=true'}" ui-keyup="{shift: 'shiftPressed=false'}" ng-click="sortColumn($index, (column.sortDirection == 0 ? 1 : 0), shiftPressed)"><span ng-show="column.isSortable" class="glyphicon glyphicon-arrow-up"></span></a>
<!-- 				<a href="" ng-show="column.isSortable && column.sortDirection < 0" ui-keydown="{shift: 'shiftPressed=true'}" ui-keyup="{shift: 'shiftPressed=false'}" ng-click="sortColumn($index, 0, shiftPressed)"><span ng-show="column.isSortable" class="glyphicon glyphicon-resize-vertical"></span></a> -->
				<a href="" ng-visible="column.isSortable && column.sortDirection <= 0" ui-keydown="{shift: 'shiftPressed=true'}" ui-keyup="{shift: 'shiftPressed=false'}" ng-click="sortColumn($index, (column.sortDirection == 0 ? -1 : 0), shiftPressed)"><span ng-show="column.isSortable" class="glyphicon glyphicon-arrow-down"></span></a>
<!-- 				<a href="" ng-show="column.isSortable && column.sortDirection > 0" ui-keydown="{shift: 'shiftPressed=true'}" ui-keyup="{shift: 'shiftPressed=false'}" ng-click="sortColumn($index, 0, shiftPressed)"><span ng-show="column.isSortable" class="glyphicon glyphicon-resize-vertical"></span></a> -->

		    </th></tr>		
	    </table>
	</div>

</body>

</html>
