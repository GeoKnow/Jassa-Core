<!DOCTYPE html>
<html ng-app="SponateDBpediaExample">

<head>
	<meta content="text/html; charset=utf-8" http-equiv="Content-Type">
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />

	<title>Sponate Example: DBpedia Castles</title>
	<link rel="stylesheet" href="resources/libs/twitter-bootstrap/2.3.2/css/bootstrap.min.css" />
	
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
	<script src="resources/libs/underscore/1.4.4/underscore.js"></script>
	<script src="resources/libs/underscore.string/2.3.0/underscore.string.js"></script>
	<script src="resources/libs/prototype/1.7.1/prototype.js"></script>
	<script src="resources/libs/angularjs/1.0.8/angular.js"></script>
	
	${jsIncludes}
	
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
	var sponate = Jassa.sponate;
	var service = Jassa.service;

	/*
	 * Sponate
	 */
	//var service = sponate.ServiceUtils.createSparqlHttp('http://localhost/sparql');
	var qef = new service.QueryExecutionFactoryHttp('http://dbpedia.org/sparql', ['http://dbpedia.org']);	
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
	
	var vsv = rdf.Node.uri('<http://s>');
	var vlv = rdf.NodeFactory.createPlainLiteral('test');

	var binding = new sparql.Binding();
	binding.put(vs, vsv);
	binding.put(vs, vlv);
	
	var aliasGenerator = sparql.GenSym.create("a");
	
	var joinNode = sponate.JoinBuilderElement.create(a, aliasGenerator.next());
	var foo = joinNode.join([vs], b, [vs], aliasGenerator.next());
	//var bar = foo.join([vl], b, [vs]);
	joinNode.leftJoin([vs], a, [vl], aliasGenerator.next());

	var joinBuilder = foo.getJoinBuilder();
	var elements = joinBuilder.getElements();
	var els = new sparql.ElementGroup(elements);
	var aliasToVarMap = joinBuilder.getAliasToVarMap();
	
	
	var rowMapper = new sponate.RowMapperAlias(aliasToVarMap);
	var aliasToBinding = rowMapper.map(binding);
	
	
	
	console.log('Final Element: ' + els);
	console.log('Var map:',  aliasToVarMap);
	console.log('Alias to Binding: ', JSON.stringify(aliasToBinding));
	
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
	 * Angular JS
	 */	
	var myModule = angular.module('SponateDBpediaExample', []);

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
