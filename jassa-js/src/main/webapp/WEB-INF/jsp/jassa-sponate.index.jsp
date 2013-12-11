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
	<script src="resources/libs/prototype/1.7.1/prototype.js"></script>
	<script src="resources/libs/angularjs/1.0.8/angular.js"></script>
	
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

	
	
	var prefLabelPropertyUris = [
		'http://www.w3.org/2004/02/skos/core#prefLabel',
	    'http://purl.org/dc/elements/1.1/title',
	    'http://purl.org/dc/terms/title',
/*
	    'http://swrc.ontoware.org/ontology#title',
	    'http://xmlns.com/foaf/0.1/name',
	    'http://usefulinc.com/ns/doap#name',
	    'http://rdfs.org/sioc/ns#name',
	    'http://www.holygoat.co.uk/owl/redwood/0.1/tags/name',
	    'http://linkedgeodata.org/vocabulary#name',
	    'http://www.geonames.org/ontology#name',
	    'http://www.geneontology.org/dtds/go.dtd#name',
*/
	    'http://www.w3.org/2000/01/rdf-schema#label',
/*
	    'http://xmlns.com/foaf/0.1/accountName',
	    'http://xmlns.com/foaf/0.1/nick',
	    'http://xmlns.com/foaf/0.1/surname',
*/	    
	    'http://www.w3.org/2004/02/skos/core#altLabel'
	];
	
// 	prefLabelPropertyUris = [
// 		'http://www.w3.org/2000/01/rdf-schema#label'
// 	];


	var prefLabelProperties = _(prefLabelPropertyUris).map(function(uri) {
	   return rdf.NodeFactory.createUri(uri); 
	});
	
	var prefLangs = ['de', 'en', ''];


	// Create a map from prop-lang key to its priority based on
	// cross joining the label urs with the langs
	// TODO This doesn't seem to make anything easier - skip it
// 	var labelPrios = {};
// 	var i = 0;
// 	_(prefLabelUris).each(function(labelUri) {
// 	    _(prefLangs).each(function(lang) {
// 	        var item = {
// 	            prio: i;
// 	        	uri: labelUri,
// 	        	lang: lang;
// 	        };
	        
// 	        var key = uri + ' ' + lang;
// 	        labelPrios[key] = item;
// 	    });
// 	});

	//{ label: {expr: '?l', prio: prioritize: fuc}}
	// { label: '?l | prioritize(?s ?p ?o)' }

	/**
	 * Create a filter statement of structure
	 * Filter()
	 */
	var createLabelFilterElement = function(labelVar, labelPrios, langPrios) {
	    
	};

	
// 	var compareArrayLessThan = function(as, bs) {
// 	    if(as.length != bs.length) {
// 	        console.log('Arrays must be of same length');
// 	        throw 'Bailing out';
// 	    }

// 	    var n = as.length;
// 	    for(var i = 0; i < n; ++i) {
// 	        var a = as[i];
// 	        var b = bs[i];
	        
// 	        var tmp = op(a, b);
// 	    }
// 	}

	var compareArray = function(as, bs, op) {
        var zipped = _.zip(as, bs);
        
        var result = false;
        for(var i = 0; i < zipped.length; ++i) {
           var item = zipped[i];
           var a = item[0];
           var b = item[1];
           
           if(op(a, b)) {
               if(op(b, a)) {
                   continue;
               }
               
               result = true;
               break;
           } else { //else if(op(b, a)) {
               if(!op(b, a)) {
                   continue;
               }

               result = false;
               break;
           }
        }
//         _(zipped).each(function(item) {
            
//         });
        
// 	    var result = zipped.every(function(a) {
// 	        var r = op(a[0], a[1]);
// 	        return r;
// 	    });
	   
	    return result;
	};
	
	var cmpLessThan = function(a, b) {
	    return a < b;
	};
	
	var exprEvaluator = new sparql.ExprEvaluatorImpl();
	
	/*
	var s = rdf.NodeFactory.createVar('s');
	var p = rdf.NodeFactory.createVar('p');
	var o = rdf.NodeFactory.createVar('o');

	var subjectExpr = new sparql.ExprVar(s);
	var propertyExpr = new sparql.ExprVar(p);
	var labelExpr = new sparql.ExprVar(o);

	var langTmp = _(prefLangs).map(function(lang) {
	   var r = new sparql.E_LangMatches(new sparql.E_Lang(labelExpr), sparql.NodeValue.makeString(lang));
	   return r;
	});
	
	// Combine multiple expressions into a single logicalOr expression.
	var langConstraint = sparql.orify(langTmp);
	
	//var propFilter = new sparql.E_LogicalAnd(
	var propFilter = new sparql.E_OneOf(propertyExpr, prefLabelProperties);
	//);
	
	
	var langElement = new sparql.ElementGroup([
        new sparql.ElementTriplesBlock([ new rdf.Triple(s, p, o)] ),
		new sparql.ElementFilter([propFilter, langConstraint])
    ]);
	
	var langElementFactory = new sparql.ElementFactoryConst(langElement);
	
// 	var test = langElement.copySubstitute(function(x) { return x; });
// 	alert('' + test);
	
	
// 	ns.AggregatorLabelConfig = Class.create({
// 	    initialize: function
// 	})
*/	
	var ns = {};
	ns.AggregatorFactoryLabel = Class.create({
	    initialize: function(labelPrios, prefLangs, labelExpr, subjectExpr, propertyExpr) {
	        this.labelPrios = labelPrios;
	        this.prefLangs = prefLangs;
	        this.labelExpr = labelExpr;
	        this.subjectExpr = subjectExpr;
	        this.propertyExpr = propertyExpr;
	    },
	    
	    createAggregator: function() {
	        var result = new ns.AggregatorLabel(
	            this.labelPrios, this.prefLangs, this. labelExpr, this.subjectExpr, this.propertyExpr
			);
	        return result;
	    },
	    
	    getVarsMentioned: function() {
	        var vm = (function(expr) {
	            var result = expr ? expr.getVarsMentioned() : [];
	            return result;
	        });
	        
	        var result = _.union(vm(this.labelExpr), vm(this.subjectExpr), vm(this.propertyExpr));
	        return result;
	    }
	});
	
	
	ns.AggregatorLabel = Class.create({
	    initialize: function(labelPrios, prefLangs, labelExpr, subjectExpr, propertyExpr) {
	        this.subjectExpr = subjectExpr;
	        this.propertyExpr = propertyExpr;
	        this.labelExpr = labelExpr;
	        
	        this.exprEvaluator = exprEvaluator;
	        
	        this.labelPrios = labelPrios;
	        this.prefLangs = prefLangs;

	        //this.defaultPropery = defaultProperty;
	        
	        this.bestMatchNode = null;
	        this.bestMatchScore = [1000, 1000];
	    },
	    
	    processBinding: function(binding) {
	        
	        // Evaluate label, property and subject based on the binding
	        var property = this.exprEvaluator.eval(this.propertyExpr, binding);
	        var label = this.exprEvaluator.eval(this.labelExpr, binding);
	        var subject = this.exprEvaluator.eval(this.subjectExpr, binding);
	       
	        
	        // Determine the score vector for the property and the language
	        var propertyScore;
	        var langScore;
	        
	        var l;
	        if(property && property.isConstant()) {
	            var p = property.getConstant().asNode();
	            var propertyUri = p.getUri();
	            propertyScore = this.labelPrios.indexOf(propertyUri);
	        }
	        
			if(label && label.isConstant()) {
			    l = label.getConstant().asNode();
			    
			    var lang = l.getLiteralLanguage();
// 			    var val = l.getLiteralLexicalForm();

// 			    if(val == 'Foobar' || val == 'Baz') {
// 			        console.log('here');
// 			    }

			    
			    langScore = this.prefLangs.indexOf(lang);
			}
			
			
			var score = [propertyScore, langScore];
			
			var allNonNegative = _(score).every(function(item) {
			    return item >= 0;
			});
			
			if(allNonNegative) {
			
				// Check if the new score is better (less than) than the current best match
				var cmp = compareArray(score, this.bestMatchScore, cmpLessThan);
		        if(cmp === true) {
		            this.bestMatchScore = score;
		            this.bestMatchNode = l;
		        }
			}
	    },
	    
	    getNode: function() {
	    	return this.bestMatchNode;  
	    },
	    
	    getJson: function() {
	        var result = null;
	        if(this.bestMatchNode) {
	    		result = this.bestMatchNode.getLiteralValue();
	        }

	    	return result;
	    }
	});
	
	//var aggLabel = new ns.AggregatorLabel(prefLabelPropertyUris, prefLangs, labelExpr, subjectExpr, propertyExpr);


	//var aggFactoryLabel = new ns.AggregatorFactoryLabel(prefLabelPropertyUris, prefLangs, labelExpr, subjectExpr, propertyExpr);

	
	ns.LabelUtil = Class.create({
	    initialize: function(aggFactory, element) {
	        this.aggFactory = aggFactory
	        this.element = element;
	    },
	    
	    getAggFactory: function() {
	        return this.aggFactory;
	    },
	    
	    getElement: function() {
	        return this.element;
	    }
	});

	ns.LabelUtilFactory = Class.create({
	   initialize: function(prefLabelPropertyUris, prefLangs) {
	       this.prefLabelPropertyUris = prefLabelPropertyUris;
	       this.prefLangs = prefLangs;
	   },
	   
	   createLabelUtil: function(labelVarName, subjectVarName, propertyVarName) {
            var s = rdf.NodeFactory.createVar(subjectVarName);
		    var p = rdf.NodeFactory.createVar(propertyVarName);
		    var o = rdf.NodeFactory.createVar(labelVarName);

		    var subjectExpr = new sparql.ExprVar(s);
		    var propertyExpr = new sparql.ExprVar(p);
		    var labelExpr = new sparql.ExprVar(o);

		    // First, create the aggregator object
		    var aggFactoryLabel = new ns.AggregatorFactoryLabel(this.prefLabelPropertyUris, this.prefLangs, labelExpr, subjectExpr, propertyExpr);
	    
		    
		    // Second, create the element
			var langTmp = _(this.prefLangs).map(function(lang) {
				var r = new sparql.E_LangMatches(new sparql.E_Lang(labelExpr), sparql.NodeValue.makeString(lang));
				return r;
			});
				
			// Combine multiple expressions into a single logicalOr expression.
			var langConstraint = sparql.orify(langTmp);
			
			//var propFilter = new sparql.E_LogicalAnd(
			var propFilter = new sparql.E_OneOf(propertyExpr, prefLabelProperties);
			//);
			
			
			var langElement = new sparql.ElementGroup([
		        new sparql.ElementTriplesBlock([ new rdf.Triple(s, p, o)] ),
				new sparql.ElementFilter([propFilter, langConstraint])
		    ]);
			
			var result = new ns.LabelUtil(aggFactoryLabel, langElement);
			return result;
	   }
	});
	
	
	//alert(aggFactoryLabel.getVarsMentioned());
	
	/*
	 * Sponate
	 */
	//var qef = new service.QueryExecutionFactoryHttp('http://cstadler.aksw.org/jassa/fp7/sparql-proxy.php', ['http://fp7-pp.publicdata.eu/'], {crossDomain: true}, {'service-uri': 'http://fp7-pp.publicdata.eu/sparql'});
	//var qef = new service.QueryExecutionFactoryHttp('sparql-proxy.php', ['http://example.org/labels'], {crossDomain: true}, {'service-uri': 'http://localhost:8802/sparql'});
	
	//var qef = new service.QueryExecutionFactoryHttp('http://cstadler.aksw.org/jassa/fp7/sparql-proxy.php', ['http://dbpedia.org'], {crossDomain: true}, {'service-uri': 'http://live.dbpedia.org/sparql'});
	//var qef = new service.QueryExecutionFactoryHttp('http://cstadler.aksw.org/jassa/fp7/sparql-proxy.php', [], {crossDomain: true}, {'service-uri': 'http://fp7-pp.publicdata.eu/sparql'});
 	//var qef = new service.QueryExecutionFactoryHttp('http://lod.openlinksw.com/sparql', ['http://dbpedia.org'], {crossDomain: true});
	//var qef = new service.QueryExecutionFactoryHttp('sparql-proxy.php', ['http://dbpedia.org'], {crossDomain: true}, {'service-uri': 'http://dbpedia.org/sparql'});
	var qef = new service.QueryExecutionFactoryHttp('sparql-proxy.php', ['http://dbpedia.org'], {crossDomain: true}, {'service-uri': 'http://lod.openlinksw.com/sparql'});

 	var store = new sponate.StoreFacade(qef, prefixes);


 	// The label util factory can be preconfigured with prefered properties and langs
	var labelUtilFactory = new ns.LabelUtilFactory(prefLabelPropertyUris, prefLangs);
	
 	// A label util can be created based on var names and holds an element and an aggregator factory.
 	var labelUtil = labelUtilFactory.createLabelUtil('o', 's', 'p');

	store.addMap({
		name: 'labels',
		template: [{
			id: '?s',
			displayLabel: labelUtil.getAggFactory(),
			hiddenLabels: [{id: '?o'}]
		}],
		from: new sparql.ElementGroup([
//            new sparql.ElementString(sparql.SparqlString.create('?s a <http://dbpedia.org/ontology/Castle>')),
            new sparql.ElementString(sparql.SparqlString.create('Filter(?s = <http://dbpedia.org/resource/Citadel_of_Damascus>)')),
            labelUtil.getElement()
        ])
	});


	store.labels.find().limit(10).asList().done(function(items) {
	   console.log(items); 
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
