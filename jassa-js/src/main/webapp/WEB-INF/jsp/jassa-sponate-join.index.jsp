<!DOCTYPE html>
<html ng-app="SponateDBpediaExample">

<head>
	<meta content="text/html; charset=utf-8" http-equiv="Content-Type">
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />

	<title>Sponate Example: DBpedia Castles</title>
	<link rel="stylesheet" href="resources/libs/twitter-bootstrap/2.3.2/css/bootstrap.min.css" />
	<link rel="stylesheet" href="resources/libs/ng-grid/ng-grid.css" />
	
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
	
	
	<script src="resources/libs/jscache/cache.js"></script>
	
	
	<script src="resources/libs/jquery/1.9.1/jquery.js"></script>
	<script src="resources/libs/underscore/1.4.4/underscore.js"></script>
	<script src="resources/libs/underscore.string/2.3.0/underscore.string.js"></script>
<!-- 	<script src="resources/libs/prototype/1.7.1/prototype.js"></script> -->
	<script src="resources/libs/angularjs/1.0.8/angular.js"></script>
	<script src="resources/libs/ng-grid/ng-grid-2.0.7.debug.js"></script>
	
	
    <script src="https://rawgithub.com/angular-ui/ng-grid/master/plugins/ng-grid-flexible-height.js"></script>
	
	${jsIncludes}
	
	<script type="text/javascript">
	$ = jQuery; // TODO needed for the ng grid flexible height plugin

	
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
	var sponate = Jassa.sponate;
	var service = Jassa.service;
	var facete = Jassa.facete;
	var util = Jassa.util;
	
	
	
	
	//alert('Query: ' + query);
	
	//throw 'Done';
	
	
	//var ftc = new 
	//var fnf = new facete.FacetNodeFactoryFacetTreeConfig(ftc);
	
	
	// What's the config for the facet table?
	// At least, we need to create the concept, which means we need the FacetConfig (baseConcept, facetNode, constraints) - but not the FacetTreeConfig
	// -> Constraints can be used to optimize the query: paths are always optional by default, however, if there is a constraint on the path, then the option can be dropped
	//var baseEf = 
	
	
	/*
	var ef = new facete.ElementFactoryTableMod()
	
	var paths = new util.ArrayList();
	var ft = new facete.FaceteTable(ftc.getFacetConfig().getFacetNode(), paths);	
	var queryFactory = ns.QueryFactoryTableMod(ef, tm);
	
	
	
	var tm = new facete.TableMod();
	var colView = tm.addColumn('s');
	//tm.getSortConditions().push(new facete.SortCondition('s', 1));
	tm.getSortConditions().push(new facete.SortCondition('s', -1, 'null'));
	tm.getSortConditions().push(new facete.SortCondition('s', -1));
	
	colView.setAggregator(new facete.Aggregator('min'));
	
	
	var baseEf = new sparql.ElementFactoryConst(sparql.ElementString.create('?s ?p ?o'));
	var qf = new facete.QueryFactoryTableMod(baseEf, tm);
	
	var query = qf.createQuery();
	*/
	
	
	
	
	
	//alert('Query: ' + query);	
	
	//alert('Column: ' + JSON.stringify(colView.getSortConditions()));

	//alert('Column Agg: ' + JSON.stringify(colView.getAggregator()));
	
	/* HashCode test
	var obj = {
		foo: 'hello',
		bar: {
			baz: 1,
			hashCode: function() { return 'hash'; }
		}
		, hashCode: function() { return 'test'; }
	};
	var hashCode = util.ObjectUtils.hashCode(obj);
	alert('hashCode: ' + hashCode);
	*/
	
	
	
	var testDenis = function() {
	    var sparqlService = new service.SparqlServiceHttp('http://dbpedia.org/sparql', ['http://dbpedia.org']);
		//var sparqlService = new service.SparqlServiceHttp('http://cstadler.aksw.org/conti/freebase/germany/sparql', ['http://freebase.com/2013-09-22/data/']);

		sparqlService = new service.SparqlServiceCache(sparqlService);
		
	    
		for(var i = 0; i < 10; ++i) {
		    //var queryString = 'Select * { <http://dbpedia.org/resource/Linux> ?p ?o } Limit 10';
			//var queryString = 'Select * { ?s ?p ?o } Limit 10';
			var queryString = 'Select * { <http://dbpedia.org/resource/Paris> ?p ?o }';

	
		    var qe = sparqlService.createQueryExecution(queryString);
			qe.setTimeout(60000);
			
			qe.execSelect().done(function(rs) {
			    
			    var bs = rs.getBindings();
			    console.log('SUCCESS ARGS', arguments);
			    
			    //alert(JSON.stringify(bs));
			}).fail(function() {
			    console.log('FAIL ARGS: ', arguments);
			    //alert('fail'); 
			});
		}
	}
	
	//testDenis();
	
	
	var testCount = function() {
	    //var sparqlService = new service.SparqlServiceHttp('http://dbpedia.org/sparql', ['http://dbpedia.org']);
	    var sparqlService = new service.SparqlServiceHttp('http://linkedgeodata.org/sparql', ['http://linkedgeodata.org']);

	    var vs = rdf.NodeFactory.createVar('s');
	    var concept = facete.ConceptUtils.createSubjectConcept(vs);
	    
	    var query = new sparql.Query();
	    query.getProjectVars().add(vs);
	    
	    query.getElements().push(concept.getElement());
	    
	    var promise = service.ServiceUtils.fetchCountQuery(sparqlService, query, 3000, 1000);
	    
	    promise.done(function(state) {
	        alert('Success counting: ' + JSON.stringify(state));
	    }).fail(function() {
	        alert('Failed counting');	        
	    });
	    
	    
	};
		
	//testCount();
	
	/*
	var Boat = Class.create({
	    classLabel: 'BoatClass',
	    initialize: function() {
	        this.baseName = 'B';
	    }
	});
	
	
	var MotorBoat = Class.create(Boat, {
	    classLabel: 'MotorBoatClass',
	    initialize: function($super) {
	        $super();
	        this.name = 'MB';
	    }
	});
	
	var boat = {
		name: 'B'
	};
	
	var motorBoat = {
		name: 'MB'
	};
	
	//motorBoat.prototype = boat;
	motorBoat.__proto__ = boat;
	*/

	
	var testSerialize = function() {
	    var serializer = new Jassa.util.Serializer();
	    
	    /*
	    var arr = ['a', 'b', 'c'];
	    arr['foo'] = 'bar';
	    arr['1'] = 'x';
	    arr['1000'] = 'moo';
	    arr.length = 5000;
	    console.log('FFS', arr.length);
	    
	    _(arr).chain().pairs().each(function(v, k) {
	       console.log(k + ': ' + typeof(k)); 
	    });
	    
	    alert(JSON.stringify(_(arr).keys()));
	    */
	    
	    serializer.indexClasses(Jassa.rdf);
	    serializer.indexClasses(Jassa.sparql);
	    serializer.indexClasses(Jassa.facete);
	    serializer.indexClasses(Jassa.sponate);
	    
	    //var motorBoat = new MotorBoat();
	    //console.log('MotorBoat', motorBoat.name, motorBoat.baseName);
	    //motorBoat.prototype.name = 'B';
	    //motorBoat.baseName = 'B';
	    //motorBoat.name = 'D';
	    var ZZZ = Class.create({
	        
	    });
	    
	    var YYY = function() {
	        
	    };
	    
	    var zzz = new ZZZ();
	    var yyy = new YYY();
	    
	    var xxx = {'a':'b'};
	    console.log(zzz, yyy, xxx, xxx.prototype, xxx.__proto, Object);
	    
	    var vs = rdf.NodeFactory.createVar('s');
	    var concept = facete.ConceptUtils.createSubjectConcept(vs);

	    //var foo = { a: concept, b: concept, c: concept, d: 'yay'};
	    var foo = new facete.FacetTreeConfig();

	    //var foo = {a: vs, b: vs};
	    //alert(foo.a.getElement() + ' --- ' + foo.a.getVar());
	    //var foo = Jassa.geo.GeoMapFactoryUtils.wgs84MapFactory;
	    
	    console.log('Foo', foo, typeof foo);
	    var data = serializer.serialize(foo);
	    
	    //var data = serializer.serialize(motorBoat);
	    
	    alert(JSON.stringify(data));
	    
	    var bar = serializer.deserialize(data);
	    
	    //alert(JSON.stringify(data) + '\n' + JSON.stringify(bar));
	    alert(JSON.stringify(bar));
	    //alert(bar.a.getElement() + ' --- ' + bar.a.getVar());
	    //alert(bar.a.getElement() + ' --- ' + bar.a.getVar());
	};
	
	testSerialize();
	
	
	
	/*
	 * Sponate
	 */
	//var service = sponate.ServiceUtils.createSparqlHttp('http://localhost/sparql');
	var qef = new service.SparqlServiceHttp('http://dbpedia.org/sparql', ['http://dbpedia.org']);	
	var store = new sponate.StoreFacade(qef, prefixes);

	// Rule of thumb: If you use optional in the from attribute, you are probably doing it wrong

	
	
	var mode = 1;
	if(mode == 0) {
		
		store.addMap({
			name: 'castles',
			template: [{
				id: '?s',
				name: '?l',
				owners: [{
					id: '?pa',
					name: '?pal',
					amount: '?a',
				}]
			}],
			from: '{ Select * { ?s a fp7o:Project ; rdfs:label ?l ; fp7o:funding [ fp7o:partner ?pa ; fp7o:amount ?a ] . ?pa rdfs:label ?pal } Limit 100 }'
		});

	} else if(mode == 1) {
		
		store.addMap({
			name: 'castles',
			template: [{
				id: '?s',
				name: '?l',
				depiction: '?d',
				owners: [{
					id: '?o',
					name: '?on'
				}]
			}],
			from: '{ Select * { ?s a dbpedia-owl:Castle ; rdfs:label ?l ; foaf:depiction ?d ; dbpedia-owl:owner ?o . ?o rdfs:label ?on . Filter(langMatches(lang(?l), "en")) . Filter(langMatches(lang(?on), "en")) } Limit 10 }'
		});
		
	} else if(mode == 2) {
	
		store.addMap({
			name: 'castles',
			template: [{
				id: '?s',      //unprefix()
				name: '?l',
				depiction: '?d',
	//			owners: ['?s']
				owners: [{
					ref: 'owners',
					//attr: 'name', // Refer to this attribute on the remote side
					//joinColumn: '?x'
					joinColumn: '?s',
					refJoinColumn: '?x'
				}]
			}],
			//from: '?s a dbpedia-owl:Castle ; rdfs:label ?l . Optional { ?s dbpedia-owl:owner ?x } . Filter(langMatches(lang(?l), "en"))'
			from: '{ Select * { ?s a dbpedia-owl:Castle ; foaf:depiction ?d ; rdfs:label ?l . Filter(langMatches(lang(?l), "en")) } Limit 10 }'
		});
		
		
		store.addMap({
			name: 'owners',
			template: [{
				id: '?s',
				name: '?l'
			}],
			from: '?x dbpedia-owl:owner ?s . ?s rdfs:label ?l . Filter(langMatches(lang(?l), "en")'
		});
	}
	
	//var a = sparql.ElementString.create('?s a dbpedia-owl:Castle ; rdfs:label ?l . Filter(langMatches(lang(?l), "en"))');
	//var b = sparql.ElementString.create('?s a dbpedia-owl:Castle ; rdfs:label ?l . Filter(langMatches(lang(?l), "en"))');
	var a = sparql.ElementString.create('?s a ?l');
	var b = sparql.ElementString.create('?s <http://ex.org> ?l');
	
	var vs = rdf.Node.v('s');
	var vl = rdf.Node.v('l');
	
// 	var vsv = rdf.Node.uri('<http://s>');
// 	var vlv = rdf.NodeFactory.createPlainLiteral('test');

// 	var binding = new sparql.Binding();
// 	binding.put(vs, vsv);
// 	binding.put(vs, vlv);
	
// 	var aliasGenerator = sparql.GenSym.create("a");
	
// 	var joinNode = sparql.JoinBuilderElement.create(a, aliasGenerator.next());
// 	var foo = joinNode.join([vs], b, [vs], aliasGenerator.next());
// 	//var bar = foo.join([vl], b, [vs]);
// 	joinNode.leftJoin([vs], a, [vl], aliasGenerator.next());

// 	var joinBuilder = foo.getJoinBuilder();
// 	var elements = joinBuilder.getElements();
// 	var els = new sparql.ElementGroup(elements);
// 	var aliasToVarMap = joinBuilder.getAliasToVarMap();
	
	
// 	var rowMapper = new sponate.RowMapperAlias(aliasToVarMap);
// 	var aliasToBinding = rowMapper.map(binding);
	
	
	
	var efA = new sparql.ElementFactoryConst(a);
	var efB = new sparql.ElementFactoryConst(b);

	//debugger;
	var efC = new sparql.ElementFactoryJoin(efA, efB, [vl], [vs], sparql.JoinType.LEFT_JOIN);
	var x = efC.createElement();
	console.log('Joined element is: ' + x);
	
	
	
	
	
// 	console.log('Final Element: ' + els);
// 	console.log('Var map:',  aliasToVarMap);
// 	console.log('Alias to Binding: ', JSON.stringify(aliasToBinding));
	
//	var varMap = sparql.ElementUtils.createJoinVarMap(a.getVarsMentioned(), b.getVarsMentioned(), [sparql.Node.v('s')], [sparql.Node.v('l')]);
//	var c = sparql.ElementUtils.createRenamedElement(b, varMap);
	
//	console.log('distinct: ' + c + ' ' + varMap.getMap(),  varMap);
	
	//var joinGraph = new ns.JoinGraphElement();
	//var alias = joinGraph.create
	
	// Creating a join: 
	
	//var promise = store.castles.find().asList();
	//var promise = store.castles.find({id: {$eq: '<http://dbpedia.org/resource/Hume_Castle>'}}).asList();
	//var promise = store.castles.find({name: {$regex: 'Cast'}}).asList();
	//var promise = store.castles.find({id: '<http://dbpedia.org/resource/Hume_Castle>'}).asList();
	
	
/*	
angular.module('ui.jassa', [])

.controller('SparqlTableCtrl', ['$scope', '$rootScope', function($scope, $rootScope) {

})


.directive('sparqlTable', function($parse) {
    return {
        restrict: 'EA', // says that this directive is only for html elements
        replace: true,
        template: '<div></div>',
        controller: 'SparqlTableCtrl',
        scope: {
            config: '=',
            onSelect: '&select',
            onUnselect: '&unselect'
        },
        link: function (scope, element, attrs) {
            
        }            
    };
})

;	
*/	
	
	
	var createQueryCountQuery = function(query, outputVar) {
    	//TODO Deterimine whether a sub query is needed
    	var result = new sparql.Query();
    	var e = new sparql.ElementSubQuery(query);
    	result.getElements().push(e);
    	result.getProjectVars().add(outputVar, new sparql.E_Count());
    	
    	return result;
	};
	
	
	
	/*
	 * Angular JS
	 */	
	var myModule = angular.module('SponateDBpediaExample', ['ngGrid']);

	
	
	myModule.factory('myService', function($rootScope, $q) {
		return {
			getCastles: function(filterText) {
				var criteria = {};
				//criteria = {name: {$or: ['bar', 'foo']}};
//				criteria = {owners: {$elemMatch: {name: {$regex: 'foo'}}}};

				if(filterText != null && filterText.length > 0) {
					//criteria = {name: {$regex: filterText}};
					//criteria = {name: {$or: [{$regex: filterText}, {$regex: 'orp'}]}};

					//criteria = {owners: {$elemMatch: {name: {$regex: filterText}}}};

					criteria = {
							$or: [
							      {name: {$regex: filterText}},
							      {owners: {$elemMatch: {name: {$regex: filterText}}}}
					]};
					
					//criteria = {name: {$regex: filterText}};
					
				}
 				
//				criteria = {};
				var promise = store.castles.find(criteria).asList();
				var result = sponate.angular.bridgePromise(promise, $q.defer(), $rootScope);
				return result;
	        }
	   };
	});

	myModule.controller('MyCtrl', function($scope, myService) {
 
	    
		var facetTreeConfig = new facete.FacetTreeConfig(); 
		var facetConfig = facetTreeConfig.getFacetConfig();
		
		var baseConcept = new facete.Concept(sparql.ElementString.create('?s a <http://fp7-pp.publicdata.eu/ontology/Project>'), rdf.NodeFactory.createVar('s'));
		
		console.log('Base Concept: ' + baseConcept);
		//facetConfig.setBaseConcept(baseConcept);
		
		var facetTableConfig = new facete.FacetTableConfig(facetConfig);		
		var paths = [
			facete.Path.parse(''),
			facete.Path.parse('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
			facete.Path.parse('http://www.w3.org/2000/01/rdf-schema#label')
		];
		
		facetTableConfig.togglePath(facete.Path.parse(''));
		
		$scope.facetTableConfig = facetTableConfig;
		
		
		/*
		facetTableConfig.togglePath(facete.Path.parse('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'));	
		facetTableConfig.togglePath(facete.Path.parse('http://www.w3.org/2000/01/rdf-schema#label'));
		*/
		var tableMod = facetTableConfig.getTableMod();
		
		
		//var colView = tableMod.addColumn('s');
		var colView = tableMod.getColumn('s');
		//colView.setAggregator(new facete.Aggregator('min'));
		
		
		//tableMod.getSortConditions().push(new facete.SortCondition('s', 1));
		
		//var query = queryFactory.createQuery();

		var colIndex = 1;
		
		
		$scope.colDefs = [{field: 'column', displayName: 'Temporary Column'}];
		
		$scope.addTestColumn = function() {
		    
		    var path = paths[colIndex];
		    
		    facetTableConfig.togglePath(path);
		    
		    ++colIndex;
		    /*
		    
            var query = queryFactory.createQuery();

		    var projectVarList = query.getProjectVars().getVarList();
		    var projectVarNameList = sparql.VarUtils.getVarNames(projectVarList);

		    var colDefs = createNgGridOptionsFromQuery(query);
		    
		    $scope.colDefs = colDefs;
		    */
            $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);

		    //$scope.gridOptions.columnDefs = createNgGridOptionsFromQuery(query); 

// 		    console.log('Column Defs: ', $scope.gridOptions.columnDefs);
//             if(!$scope.$$phase) {
//                 $scope.$apply();
//             }
		    
		    /*
            if (!$scope.$$phase) {
                $scope.$apply();
            }
            */

		};
		
		
	    
	    var sparqlService = new service.SparqlServiceHttp('http://fp7-pp.publicdata.eu/sparql', ['http://fp7-pp.publicdata.eu/']);
	    
	    sparqlService = new service.SparqlServiceCache(sparqlService);
	    sparqlService = new service.SparqlServiceVirtFix(sparqlService);
	    
	    /*
	    $scope.myData = [{name: "Moroni", age: 50},
	                     {name: "Tiancum", age: 43},
	                     {name: "Jacob", age: 27},
	                     {name: "Nephi", age: 29},
	                     {name: "Enos", age: 34}];

	    $scope.gridOptions = { 
	        data: 'myData',
	        //data: $scope.myData,
	        columnDefs: [{field:'name', displayName:'Name'}, {field:'age', displayName:'Age'}]
	    };
	    */
	    var createNgGridOptionsFromQuery = function(query) {
		    var projectVarList = query.getProjectVars().getVarList();
		    var projectVarNameList = sparql.VarUtils.getVarNames(projectVarList);

		    var result = _(projectVarNameList).map(function(varName) {
                var col = {
                    field: varName,
                    displayName: varName
                };
                    
                return col;		        
		    });
		    
		    return result;
	    }
	    
	    $scope.filterOptions = {
	            filterText: "",
	            useExternalFilter: true
	        }; 
	        $scope.totalServerItems = 0;
	        
	        $scope.pagingOptions = {
	            pageSizes: [10, 50, 100, 500, 1000],
	            pageSize: 10,
	            currentPage: 1
	        };	

	        $scope.getPagedDataAsync = function (pageSize, page, searchText) {

	    		var queryFactory = new facete.QueryFactoryFacetTable(facetTableConfig);

	            
	            var query = queryFactory.createQuery();

			    var projectVarList = query.getProjectVars().getVarList();
			    var projectVarNameList = sparql.VarUtils.getVarNames(projectVarList);

			    var colDefs = createNgGridOptionsFromQuery(query);
			    
			    $scope.colDefs = colDefs;
			    //$scope.gridOptions.columnDefs = createNgGridOptionsFromQuery(query); 

			    //console.log('columnDefs set: ', $scope.gridOptions.columnDefs);
			    
	            query.setLimit(null);
	            query.setOffset(null);
	            
	            var countVar = rdf.NodeFactory.createVar('_c_');
	            var countQuery = createQueryCountQuery(query, countVar);
	            var countQe = sparqlService.createQueryExecution(countQuery);
				var promise = service.ServiceUtils.fetchInt(countQe, countVar);

				
				console.log('Count Query: ' + countQuery);
				promise.done(function(count) {
				    $scope.totalServerItems = count;
		            if (!$scope.$$phase) {
		                $scope.$apply();
		            }				    
				});
	            
	            
	            var offset = (page - 1) * pageSize;
	            
	            
	            query.setLimit(pageSize);
	            query.setOffset(offset);
	  
	           				
	            
				var qe = sparqlService.createQueryExecution(query);

				qe.execSelect().done(function(rs) {
				    var data = [];
				    
				    var projectVarList = query.getProjectVars().getVarList();
				    
				    while(rs.hasNext()) {
				        var binding = rs.next();
				        
				        var o = {};
				        
				        _(projectVarList).each(function(v) {
				            var varName = v.getName();
				            o[varName] = '' + binding.get(v); 
				        });
				        
				        
				        data.push(o);
				    }
				    				    
				    
				    //var data = rs.getIterator().getArray();
				    $scope.myData = data;
				    
		            if (!$scope.$$phase) {
		                $scope.$apply();
		            }				    
				});	
				
				
				console.log('Scope: ', $scope);
	        };
	    	
	    	
	        $scope.$watch('pagingOptions', function (newVal, oldVal) {
	            if (newVal !== oldVal && newVal.currentPage !== oldVal.currentPage) {
	              $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
	            }
	        }, true);
	        $scope.$watch('filterOptions', function (newVal, oldVal) {
	            if (newVal !== oldVal) {
	              $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
	            }
	        }, true);
	    	
	        $scope.gridOptions = {
	            data: 'myData',
	            enablePaging: true,
	            useExternalSorting: true,
	    		showFooter: true,
	            totalServerItems: 'totalServerItems',
	            sortInfo: {
	                fields: [],
	                directions: [],
	                columns: []
	            },
	            pagingOptions: $scope.pagingOptions,
	            filterOptions: $scope.filterOptions,
	            plugins: [new ngGridFlexibleHeightPlugin(30)],
	            columnDefs: 'colDefs'
	            //columnDefs: facete.TabelUtils.createNgGridColumnDefs(tableMod)
	        };	    
	    
	    
	    	$scope.$watch('gridOptions.sortInfo', function(sortInfo) {
	    	    console.log('sort', sortInfo);
	    	    
	    	    util.ArrayUtils.clear(tableMod.getSortConditions());
	    	    
	    	    
	    	    for(var i = 0; i < sortInfo.fields.length; ++i) {
	    	        var columnId = sortInfo.fields[i];
	    	        var dir = sortInfo.directions[i];
	    	        
	    	        var d = 0;
	    	        if(dir === 'asc') {
	    	            d = 1;
	    	        }
	    	        else if(dir === 'desc') {
	    	            d = -1;
	    	        }
	    	        
	    	        if(d !== 0) {
	    	        	var sortCondition = new facete.SortCondition(columnId, d);
	    	        	tableMod.getSortConditions().push(sortCondition);
	    	        }
	    	    }
	    	    
		        $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
	    	    
	    	    
	    	}, true);
	    
	        $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);

	    
	    /*
			$scope.$watch('facetTableConfig', function() {
	            $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
			}, true);
*/
	    
	    
	    
	    
	    
	    
		$scope.filterTable = function() {
			$scope.castles = myService.getCastles($scope.filterText);
		};
		
		$scope.init = function() {
			$scope.filterTable();
		};
	});

	// Utility filter for comma separated values
	// Source: http://stackoverflow.com/questions/16673439/comma-separated-p-angular
	myModule.filter('map', function() {
		return function(input, propName) {
			return input.map(function(item) {
				return item[propName];
			});
		};
	});
	
	</script>
</head>

<body ng-controller="MyCtrl" data-ng-init="init()">


	
	<h2>Grid</h2>
	<div ng-grid="gridOptions"></div>
	<button ng-click="addTestColumn()">Add column</button>



	<h2>Stuff</h2>
	<div class="row-fluid">
		<div class="span8 offset2">
			<form ng-submit="filterTable()">
		    	<input type="text" ng-model="filterText" />
				<input class="btn-primary" type="submit" value="Filter" />
			</form>
		
			<table class="table table-striped">
				<tr><th>Project</th><th>Partner</th><th>Amount</th></tr>
				<tr ng-repeat="castle in castles">
					<td>{{castle.name}}</td>
					<td>
						<ul ng-repeat="owner in castle.owners">
							<li>{{owner.name}}, {{owner.amount}}</li>
						</ul>
					<td>
				</tr>
			</table>

		</div>
	</div>
</body>

</html>

