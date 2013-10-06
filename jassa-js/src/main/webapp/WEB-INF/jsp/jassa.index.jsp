<!DOCTYPE html>
<html ng-app="SponateDBpediaExample">

<head>
	<meta content="text/html; charset=utf-8" http-equiv="Content-Type">
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />

	<title>Sponate Example: DBpedia Castles</title>
	${cssIncludes}
	
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
		'rdfs': 'http://www.w3.org/2000/01/rdf-schema#'
	};

	var rdf = Jassa.rdf;
	var sparql = Jassa.sparql;
	var sponate = Jassa.sponate;

	/*
	 * Sponate
	 */
	var service = sponate.ServiceUtils.createSparqlHttp('http://dbpedia.org/sparql', ['http://dbpedia.org']);	
	var store = new sponate.StoreFacade(service, prefixes);

	// Rule of thumb: If you use optional in the from attribute, you are probably doing it wrong
	
	store.addMap({
		name: 'castles',
		template: [{
			id: '?s',      //unprefix()
			name: '?l',
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
		from: '?s a dbpedia-owl:Castle ; rdfs:label ?l . Filter(langMatches(lang(?l), "en"))'
	});
	
	
	store.addMap({
		name: 'owners',
		template: [{
			id: '?s',
			name: '?l'
		}],
		from: '?x dbpedia-owl:owner ?s . ?s rdfs:label ?l . Filter(langMatches(lang(?l), "en")'
	});

	
	var a = sparql.ElementString.create('?s a dbpedia-owl:Castle ; rdfs:label ?l . Filter(langMatches(lang(?l), "en"))');
	var b = sparql.ElementString.create('?s a dbpedia-owl:Castle ; rdfs:label ?l . Filter(langMatches(lang(?l), "en"))');
	var c = sparql.ElementUtils.makeElementDistinct(a, b);
	console.log('distinct: ' + c.element, c.map);
	
	// Creating a join: 
	
	//var promise = store.castles.find().asList();
	//var promise = store.castles.find({id: {$eq: '<http://dbpedia.org/resource/Hume_Castle>'}}).asList();
	//var promise = store.castles.find({name: {$regex: 'Cast'}}).asList();
	var promise = store.castles.find({id: '<http://dbpedia.org/resource/Hume_Castle>'}).asList();
	
	
	/*
	 * Angular JS
	 */	
	var myModule = angular.module('SponateDBpediaExample', []);

	myModule.factory('myService', function($rootScope, $q) {
		return {
			getCastles: function() {
				var result = sponate.angular.bridgePromise(promise, $q.defer(), $rootScope);
				//return store.castles.find().forAngular(); 				
				return result;
	        }
	   }
	});

	myModule.controller('MyCtrl', function($scope, $q, myService) {
		$scope.castles = myService.getCastles();
		
		$scope.filterTable = function() {
			var filterText = $scope.filterText;
			console.log(filterText);
			var promise = store.castles.find({name: {$regex: filterText}}).asList();
			$scope.castles = sponate.angular.bridgePromise(promise, $q.defer(), $scope);			
		}
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

<body ng-controller="MyCtrl">
	<form ng-submit="filterTable()">
    	<input type="text" ng-model="filterText"></input>
		<input class="btn-primary" type="submit" value="add">
	</form>

	<table>
		<tr ng-repeat="castle in castles">
			<td>{{castle.name}}<td>
			<td>{{(castle.owners | map:'name').join(' ----- ')}}</td>
		</tr>
	</table>
</body>

</html>
