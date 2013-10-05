<!DOCTYPE html>
<html class="js" lang="en" dir="ltr" xmlns="http://www.w3.org/1999/xhtml">

<head>
	<meta content="text/html; charset=utf-8" http-equiv="Content-Type">
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />

	<title>Jassa test</title>
	${cssIncludes}
	
	<script src="resources/libs/jquery/1.9.1/jquery.js"></script>
	<script src="resources/libs/underscore/1.4.4/underscore.js"></script>
	<script src="resources/libs/underscore.string/2.3.0/underscore.string.js"></script>
	<script src="resources/libs/prototype/1.7.1/prototype.js"></script>
	
	${jsIncludes}

	<script type="text/javascript">
		// Mix in underscore.string into underscore.
		// There are several ways to accomplish this, so for Jassa to stay agnostic,
		// this is left up to you - Yes, JavaScript sucks. 
		_.mixin(_.str.exports());
	</script>
	
	<script type="text/javascript">
	// Mix in underscore.string into underscore.
	// There are several ways to accomplish this, so for Jassa to stay agnostic,
	// this is left up to you - Yes, JavaScript sucks. 
	_.mixin(_.str.exports());
	

	var sparql = Jassa.sparql;
	//var sponate = Jassa.sponate;
	
	var sponate = Jassa.sponate;

	// TODO Convert to real test cases (some are unit and some are integration tests)
	
	
	var testSponateDBpedia = {

		var prefixes = {
			'dbpedia-owl': 'http://dbpedia.org/ontology/',
			'dbpedia': 'http://.org/resource/',
			'rdfs': 'http://www.w3.org/2000/01/rdf-schema#'
		};

		var schema = new sponate.SparqlSchema();
		schema.getPrefixMap().addJson(prefixes);

		
		var castleTable = schema.createTable('castle', '?s a dbpedia-owl:Castle ; rdfs:label ?l ; dbpedia-owl:owner ?o . Filter(langMatches(lang(?l), "en"))');
		var ownerTable = schema.createTable('owner', '?s rdfs:label ?l');

		console.log('castleTable ' + castleTable);
		console.log('castleownerTable ' + castleTable);
		
		
		//alert('' + t1);
		return ;
		
				var service = new sparql.SparqlServiceHttp('http://dbpedia.org/sparql', ['http://dbpedia.org']);

		
 		
		// Not sure if we need this context thing
		// The most convenient thing would be having the document creation as part of the store
 		var context = new sponate.Context();
		
// 		var concept = context.registerConcept('RdbRdfMappings', '?x a o:RdbRdfMap');


		/*
		 * Syntax notes:
		 * [] indicates a collection type and is ALWAYS configured using the enclosed object
		 * [{options}]
		 * items holds the elements
		 */

		var docMap = context.startDoc('name').
			template([{
				id: '?s',
				path: '?p',
				//name: '?: label',
				jdbcConnection: {
					id: '?c',
					url: '?j',
					//user: '?u' // ?\label ?u: This field should become the label of ?u
				},
				mappingResource: {
					id: '?m'
				},

				foos: [{// Create an array of objects
					id: '?s',
					yada: 'daya',
					wee: '?c'
				}]
        
				
//                 bars: [{
//                 	items: '?s' // Create an array of literals
//                 }],
                
//                 bazs: [{
//                 	type: 'map',
//                 	items: 's' 
//                 }]
                
//                 bims: [{
//                 	ref: 'some doc name',
                	
//                 }]
			}])
			//.prefixes(prefixes) -- prefixes can be taken from the context
			.from('?s o:path ?p ; o:jdbcConnection ?c ; o:mappingResource ?m .' +
				  '?c o:jdbcUrl ?j ; o:user ?u .') // I suppose this should create a table with the same name as the document
			.build();
		
	};
	
	
	var testSpate = function() {
				
		
		var prefixes = {
			'o': 'http://example.org/ontology/',
			'r': 'http://example.org/resource/'
		};
		
		
		var maaa = sparql.expandPrefixes(prefixes, 'o:foo r:bar');

		
		// Create the service object
		var service = new sparql.SparqlServiceHttp('http://dbpedia.org/sparql', ['http://dbpedia.org']);
 		
		// Create a store / this things holds all the documents
		var store = new sponate.Store(service);

		
		var schema = new sponate.SparqlSchema();
		schema.getPrefixMap().addJson(prefixes);
		
		
		var t1 = schema.createTable('foo', '?s o:moo ?t');
		var t2 = schema.createTable('bar', '?x r:weee ?y');
		
		//alert('' + t1);
		
		
 		
		// Not sure if we need this context thing
		// The most convenient thing would be having the document creation as part of the store
 		var context = new sponate.Context();
		
// 		var concept = context.registerConcept('RdbRdfMappings', '?x a o:RdbRdfMap');


		/*
		 * Syntax notes:
		 * [] indicates a collection type and is ALWAYS configured using the enclosed object
		 * [{options}]
		 * items holds the elements
		 */

		var docMap = context.startDoc('name').
			template([{
				id: '?s',
				path: '?p',
				//name: '?: label',
				jdbcConnection: {
					id: '?c',
					url: '?j',
					//user: '?u' // ?\label ?u: This field should become the label of ?u
				},
				mappingResource: {
					id: '?m'
				},

				foos: [{// Create an array of objects
					id: '?s',
					yada: 'daya',
					wee: '?c'
				}]
        
				
//                 bars: [{
//                 	items: '?s' // Create an array of literals
//                 }],
                
//                 bazs: [{
//                 	type: 'map',
//                 	items: 's' 
//                 }]
                
//                 bims: [{
//                 	ref: 'some doc name',
                	
//                 }]
			}])
			//.prefixes(prefixes) -- prefixes can be taken from the context
			.from('?s o:path ?p ; o:jdbcConnection ?c ; o:mappingResource ?m .' +
				  '?c o:jdbcUrl ?j ; o:user ?u .') // I suppose this should create a table with the same name as the document
			.build();

	
		// store.find has to return a proxy wrapper around the document...
	
		var cursor = store.find(docMap);
	
		
		
		var template = docMap;
		console.log(JSON.stringify(template));
		
		
		var someUri = sparql.Node.uri('http://foo.bar');
		console.log('value is ' + someUri);

		var binding = new sparql.Binding();
		binding.put(sparql.Node.v('s'), sparql.Node.uri('http://foo.bar'));
		
		// Pitfall: Bindings map to Nodes, not to NodeValues!
		// TODO Create some facade to simplify this.
		
		binding.put(sparql.Node.v('p'), sparql.NodeValue.makeString('test').asNode());
		binding.put(sparql.Node.v('j'), sparql.NodeValue.makeInteger(5).asNode());
		console.log('binding: ' + binding);
		
		
		//var instancer = new sponate.PatternVisitorInstantiate();
		var instancer = new sponate.PatternVisitorData(template);
		
		instancer.instantiate(binding);
		instancer.instantiate(binding);

		
		binding.put(sparql.Node.v('s'), sparql.Node.uri('http://exr'));
		instancer.instantiate(binding);

		
		var json = instancer.getJson();
		
		//var obj = instancer.instantiate(template, binding);
		
		console.log('final', JSON.stringify(json));
		
		
		
		
		//var pattern = template.accept(instancer, binding);

				
// 			withConcept(concept).
// 			via({'?x': '?s'}).
// 			build();
			
// 		);
		
		
// 		var docMap = sponate.createDoc({
// 				id: '?s',
// 		        '?p': ['?o'] 
// 		    },
// 			'?s ?p ?o'
// 		);
		
		
		
		
	};
	
	var foo = function() {
		// I just noted that a similar idea was expressed here:
		// http://lists.w3.org/Archives/Public/public-linked-json/2012Jul/0046.html
		
		var myJsonLdObject = {
		  "@context": {
			    "name": "http://xmlns.com/foaf/0.1/name",
			    "homepage": {
					"@id": "http://xmlns.com/foaf/0.1/homepage",
					"@type": "@id"
			    }
			}
		};
		
 		var directMappingWithJsonLd = myJsonLdObject['@context'];

	};
	
	var test1 = function() {
		var sparql = Jassa.sparql;
		
		var service = new sparql.SparqlServiceHttp('http://dbpedia.org/sparql', ['http://dbpedia.org']);
		var promise = service.execSelect('Select * { ?s ?p ?o } Limit 10');
		
		
		promise.done(function(data) {
			var str = JSON.stringify(data);
			$('#output').html(str)
		}).fail(function() {
			$('#div').html('Fail');
		});
	};

	var testExprInheritance = function() {
		var e = new sparql.ExprVar(sparql.Node.v("hi"));
		var f = new sparql.ExprVar(sparql.Node.v("moo"));
		
		console.log('e', e);
		console.log('e', e instanceof sparql.Expr);
		console.log('e', e.isVar());
		console.log('e', e.getArgs());
		
		var x = new sparql.E_Equals(e, e);
		var y = x.copy([f, f]);
		console.log('f ' + y);
		console.log('f ' + y.isFunction());
	};

	var testProxy = function() {
		
		// A test with creating an asynchronous request on accessing a property
		// Seems to work
		var obj = {};
		Object.defineProperty(obj, 'test', {
			get: function() {
				//var service = new sparql.SparqlServiceHttp('http://dbpedia.org/sparql', ['http://dbpedia.org']);
				
				var result;
				jQuery.ajax({
					url: 'http://dbpedia.org/sparql?default-graph-uri=http://dbpedia.org&query=Select%20%28Count%28*%29%20As%20?c%29%20{%20?s%20a%20%3Chttp://example.org/Foobar%3E%20}',
					async: false,
					type: 'GET',
					dataType: 'json',
					success: function(data) {
						result = JSON.stringify(data);
						console.log(data);
					}
				});

				return result;
			}
		});
		
		alert(obj.test);
	};
	
	//testProxy();
	//testSpate();
	//test2();
	
	
	testSponateDBpedia();
	
	
	//testExprInheritance();

	</script>
</head>
<body>

    <div id="output"></div>

</body>
</html>
