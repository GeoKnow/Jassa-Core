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
<!-- 	<script src="resources/libs/angularjs/1.0.8/angular.js"></script> -->
	<script src="resources/libs/angularjs/1.2.0-rc.3/angular.js"></script>	
	
	${jsIncludes}
	
	<script type="text/javascript">
	_.mixin(_.str.exports());

	(function() {
	
	    
	/*
	 * Configuration
	 */
	    
	var prefixes = {
		'dbpedia-owl': 'http://dbpedia.org/ontology/',
		'dbpedia': 'http://.org/resource/',
		'rdfs': 'http://www.w3.org/2000/01/rdf-schema#',
		'foaf': 'http://xmlns.com/foaf/0.1/',
		'fp7o': 'http://fp7-pp.publicdata.eu/ontology/',
		'fp7r': 'http://fp7-pp.publicdata.eu/resource/'
	};
		
	var prefLabelPropertyUris = [
		'http://www.w3.org/2004/02/skos/core#prefLabel',
	    'http://purl.org/dc/elements/1.1/title',
	    'http://purl.org/dc/terms/title',

	    'http://swrc.ontoware.org/ontology#title',
	    'http://xmlns.com/foaf/0.1/name',
	    'http://usefulinc.com/ns/doap#name',
	    'http://rdfs.org/sioc/ns#name',
	    'http://www.holygoat.co.uk/owl/redwood/0.1/tags/name',
	    'http://linkedgeodata.org/vocabulary#name',
	    'http://www.geonames.org/ontology#name',
	    'http://www.geneontology.org/dtds/go.dtd#name',

	    'http://www.w3.org/2000/01/rdf-schema#label',

	    'http://xmlns.com/foaf/0.1/accountName',
	    'http://xmlns.com/foaf/0.1/nick',
	    'http://xmlns.com/foaf/0.1/surname',
	    
	    'http://www.w3.org/2004/02/skos/core#altLabel'
	];

	prefLabelPropertyUris = [
        'http://www.w3.org/2000/01/rdf-schema#label',
    ];

	var prefLangs = ['de', 'en', ''];


	/*
	 * Namespaces
	 */
	
	var rdf = Jassa.rdf;
	var sparql = Jassa.sparql;
	var service = Jassa.service;
	var sponate = Jassa.sponate;
	
	// TODO: Move Concept to sparql namespace
	var facete = Jassa.facete;
	

	
	/*
	 * Sponate
	 */
	//var qef = new service.SparqlServiceHttp('http://cstadler.aksw.org/jassa/fp7/sparql-proxy.php', ['http://fp7-pp.publicdata.eu/'], {crossDomain: true}, {'service-uri': 'http://fp7-pp.publicdata.eu/sparql'});
	//var qef = new service.SparqlServiceHttp('sparql-proxy.php', ['http://example.org/labels'], {crossDomain: true}, {'service-uri': 'http://localhost:8802/sparql'});
	
	//var qef = new service.SparqlServiceHttp('http://cstadler.aksw.org/jassa/fp7/sparql-proxy.php', ['http://dbpedia.org'], {crossDomain: true}, {'service-uri': 'http://live.dbpedia.org/sparql'});
	//var qef = new service.SparqlServiceHttp('http://cstadler.aksw.org/jassa/fp7/sparql-proxy.php', [], {crossDomain: true}, {'service-uri': 'http://fp7-pp.publicdata.eu/sparql'});
 	//var qef = new service.SparqlServiceHttp('http://lod.openlinksw.com/sparql', ['http://dbpedia.org'], {crossDomain: true});
	//var qef = new service.SparqlServiceHttp('sparql-proxy.php', ['http://dbpedia.org'], {crossDomain: true}, {'service-uri': 'http://dbpedia.org/sparql'});
	var sparqlService = new service.SparqlServiceHttp('sparql-proxy.php', ['http://dbpedia.org'], {crossDomain: true}, {'service-uri': 'http://lod.openlinksw.com/sparql'});

	var ssf = new service.SparqlServiceFactoryConst(sparqlService);

	
// 	var qcf = new service.QueryCacheFactory();
// 	qcf.createCache(sparqlService);
	
	

	// Sponate uses a service factory in order to allow easy exchange of the service

	// The cache factory re-uses caches if it figures out that the
	// requested cache is uses the same settings as an existing one
	//var cacheFactory = ns.QueryCacheNodeFactoryImpl();
	
 	var store = new sponate.StoreFacade(sparqlService, prefixes);//, cacheFactory);


 	// The label util factory can be preconfigured with prefered properties and langs
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
        from:  labelUtil.getElement()
// 		from: new sparql.ElementGroup([
//             sparql.ElementString.create('Filter(?s = <http://dbpedia.org/resource/Citadel_of_Damascus>)'),
//             labelUtil.getElement()
//         ])
//  new sparql.ElementString(sparql.SparqlString.create('?s a <http://dbpedia.org/ontology/Castle>')),
	});
	
	var concept = new facete.Concept(sparql.ElementString.create('?s a <http://dbpedia.org/ontology/Castle>'), rdf.NodeFactory.createVar('s'));
	
	// store.labels.fetchByIds(nodes)
	// store.labels.fetchByJoin(element)
	
	// TODO Would it make sense to add a SPARQL-SQL layer below Sponate?
	// So we would define the schema of a SPARQL result set by annotating the variables to which
	// rdf term they correspond. This would be needed for rewriting criterias:
	// - is 'http://foo.bar' a string or a URI?
	
	var foo = store.labels.find({hiddenLabels: {$elemMatch: {id: {$regex: 'mask'}}}}).concept(concept, true).limit(10);
	foo.count().done(function(count) {
	    console.log('count', count); 
	});
	
	foo.asList().done(function(items) {
	    console.log('Yay', items); 
	});
	
	
	return;
	
	// Rule of thumb: If you use optional in the from attribute, you are probably doing it wrong

	var mode = 1;
	if(mode == 0) {
		
		store.addMap({
			name: 'projects',
			template: [{
				id: '?s',
				//displayName: labelAggregator // Aggregator fields cannot be filtered server side. 
				name: '?l',
				partners: [{
					id: '?o',
					name: '?pl',
					amount: '?a',
				}]
			}],
			from: '{ Select * { ?s a fp7o:Project ; rdfs:label ?l ; fp7o:funding [ fp7o:partner [ rdfs:label ?pl ] ; fp7o:amount ?a ] } Limit 10 }'
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
			//from: '{ Select * { ?s a dbpedia-owl:Castle ; rdfs:label ?l ; foaf:depiction ?d ; dbpedia-owl:owner ?o . ?o rdfs:label ?on . Filter(langMatches(lang(?l), "en")) . Filter(langMatches(lang(?on), "en")) } Limit 10 }'
			from: '?s a dbpedia-owl:Castle ; rdfs:label ?l ; foaf:depiction ?d ; dbpedia-owl:owner ?o . ?o rdfs:label ?on . Filter(langMatches(lang(?l), "en")) . Filter(langMatches(lang(?on), "en"))'
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
	
 	var a = sparql.ElementString.create('?s a dbpedia-owl:Castle ; rdfs:label ?l . Filter(langMatches(lang(?l), "en"))');
 	var b = sparql.ElementString.create('?s a dbpedia-owl:Castle ; rdfs:label ?l . Filter(langMatches(lang(?l), "en"))');
// 	var c = sparql.ElementUtils.makeElementDistinct(a, b);
 	//console.log('distinct: ' + c.element, c.map);
	
 	var foo;
 	eval('foo=' + '{a: 1}');
 	alert(JSON.stringify(foo));
 	
 	

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
				var criteria;
				
				criteria = {};
				//criteria = {name: {$or: ['bar', 'foo']}};
				//criteria = {owners: {$elemMatch: {name: {$regex: 'foo'}}}};

				if(filterText != null && filterText.length > 0) {
//					criteria = {name: {$regex: filterText}};
					//criteria = {name: {$or: [{$regex: filterText}, {$regex: 'orp'}]}};

					criteria = {owners: {$elemMatch: {name: {$regex: filterText}}}};

// 					criteria = {
// 							$or: [
// 							      {name: {$regex: filterText}},
// 							      {owners: {$elemMatch: {name: {$regex: filterText}}}}
// 					]};
				}
 				
				var promise = store.castles.find(criteria).limit(10).skip(10).asList();
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
