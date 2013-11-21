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

	
	/*
	 * Sponate
	 */

	var sponate = Jassa.sponate;

	var prefixes = {
		'dbpedia-owl': 'http://dbpedia.org/ontology/',
		'dbpedia': 'http://.org/resource/',
		'rdfs': 'http://www.w3.org/2000/01/rdf-schema#'
	};

	var service = sponate.ServiceUtils.createSparqlHttp('http://dbpedia.org/sparql', ['http://dbpedia.org']);		
	var store = new sponate.StoreFacade(service, prefixes);

	store.addMap({
		name: 'castles',
		template: [{
			id: '?s',
			name: '?l',
			owners: [{
				ref: 'owners',
				//card: 1, //Use this if you assume there is only 1 owner per castle
				joinColumn: '?o'
			}]
		}],
		from: '?s a dbpedia-owl:Castle ; rdfs:label ?l ; dbpedia-owl:owner ?o . Filter(langMatches(lang(?l), "en"))'
	});
	
	store.addMap({
		name: 'owners',
		template: [{
			id: '?s',
			name: '?l'			
		}],
		from: '?s rdfs:label ?l'
	});
	
	/*
	 * Angular JS
	 */
	
	var myModule = angular.module('SponateDBpediaExample', []);

	myModule.factory('myService', function($http) {
		return {
			getCastles: function() {
				return store.castles.find().forAngular(); 				
	        }
	   }
	});

	myModule.controller('MyCtrl', function($scope, myService) {
		$scope.castles = myService.getCastles();
	});

	
	</script>
</head>

<body>

	<table>
		<tr><th>Name</th><th>Owners</th></tr>
		<tr ng-repeat="castle in castles">
			<td>{{castle.name}}</td>
			<td><span ng-repeat="owner in castle.owners">{{owner}}</span></td>
		</tr>
	</table>

</body>
</html>
