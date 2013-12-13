<!DOCTYPE html>
<html ng-app="SponateDBpediaExample">

<head>
	<meta content="text/html; charset=utf-8" http-equiv="Content-Type">
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />

	<title>Sponate Example: DBpedia Castles</title>
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
	<script src="resources/libs/angularjs/1.0.8/angular.js"></script>
	
	<script src="resources/libs/monsur-jscache/2013-12-02/cache.js"></script>
	
	
	${jsIncludes}
	
	<script type="text/javascript">
	_.mixin(_.str.exports());

	(function() {
	
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

	var sparqlService = new service.SparqlServiceHttp('sparql-proxy.php', ['http://dbpedia.org'], {crossDomain: true}, {'service-uri': 'http://lod.openlinksw.com/sparql'});

	// This cache ensures that duplicate queries are not executed multiple times 
	sparqlService = new service.SparqlServiceCache(sparqlService);
	
	var query = new sparql.Query();
	query.setResultStar(true);
	query.getElements().push(sparql.ElementString.create('?s rdfs:label ?l'));

	var cache = new service.QueryCacheBindingHashSingle(sparqlService, query, new sparql.ExprVar(rdf.NodeFactory.createVar('s')));	
	var nodes = [rdf.NodeFactory.createUri('http://dbpedia.org/resource/Linux')];
	
	var showResult = function(rs) {
	    while(rs.hasNext()) {
	        var binding = rs.nextBinding();
	        console.log('' + binding); 
	    }
	    console.log('Done');
	};
	
	cache.fetchResultSet(nodes).done(showResult).fail(function() { alert('fail'); });
	cache.fetchResultSet(nodes).done(showResult).fail(function() { alert('fail'); });
	cache.fetchResultSet(nodes).done(showResult).fail(function() { alert('fail'); });
	
	/*
	 * Angular JS
	 */	
	var myModule = angular.module('SponateDBpediaExample', []);

	myModule.factory('myService', function($rootScope, $q) {
		return {
			getCastles: function(filterText) {
				return [];
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
	
	})();
	
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
				<tr><th>Image</th><th>Name</th><th>Owners</th></tr>
				<tr ng-repeat="castle in castles">
					<td>
						<div class="image-frame">
							<img class="image" src="{{castle.depiction.slice(1, -1)}}" />
						</div>
					</td>
					<td><a href="{{castle.id.slice(1, -1)}}" target="_blank">{{castle.name}}</a></td>
					<td>{{(castle.owners | map:'name').join(', ')}}</td>
				</tr>
			</table>
		</div>
	</div>
</body>

</html>
