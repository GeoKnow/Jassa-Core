package org.aksw.jassa.web.main;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.aksw.jassa.sparql_path.utils.ElementUtils;
import org.aksw.jena_sparql_api.cache.core.QueryExecutionFactoryCacheEx;
import org.aksw.jena_sparql_api.cache.extra.CacheCoreEx;
import org.aksw.jena_sparql_api.cache.extra.CacheCoreH2;
import org.aksw.jena_sparql_api.cache.extra.CacheEx;
import org.aksw.jena_sparql_api.cache.extra.CacheExImpl;
import org.aksw.jena_sparql_api.core.QueryExecutionFactory;
import org.aksw.jena_sparql_api.delay.core.QueryExecutionFactoryDelay;
import org.aksw.jena_sparql_api.http.QueryExecutionFactoryHttp;
import org.aksw.jena_sparql_api.pagination.core.QueryExecutionFactoryPaginated;
import org.aksw.jena_sparql_api.retry.core.QueryExecutionFactoryRetry;

import com.hp.hpl.jena.graph.Node;
import com.hp.hpl.jena.query.Query;
import com.hp.hpl.jena.query.QueryExecution;
import com.hp.hpl.jena.query.QueryFactory;
import com.hp.hpl.jena.query.ResultSet;
import com.hp.hpl.jena.query.Syntax;
import com.hp.hpl.jena.sparql.core.Var;
import com.hp.hpl.jena.sparql.engine.binding.Binding;
import com.hp.hpl.jena.sparql.expr.E_OneOf;
import com.hp.hpl.jena.sparql.expr.ExprList;
import com.hp.hpl.jena.sparql.expr.ExprVar;
import com.hp.hpl.jena.sparql.expr.NodeValue;
import com.hp.hpl.jena.sparql.syntax.Element;
import com.hp.hpl.jena.sparql.syntax.ElementFilter;
import com.hp.hpl.jena.sparql.syntax.ElementGroup;


public class AdjacencyMatrixMain {

	
	//final static Query propertyAdjancencyQuery = QueryFactory.create("Select ?p1 ?p2 (Count(*) As ?c) { ?x ?p1 ?y . ?y ?p2 ?z } Group By ?p1 ?p2 Order By Asc(?p1) Asc(?c) Asc(?p2)", Syntax.syntaxSPARQL_11);
    final static Query propertyAdjancencyQuery = QueryFactory.create("Prefix rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns#> Select ?p1 ?p2 (Count(*) As ?c) { ?x ?p1 ?y . ?y ?p2 ?z . ?p1 a rdf:Property . ?p2 a rdf:Property } Group By ?p1 ?p2 Order By Asc(?p1) Asc(?c) Asc(?p2)", Syntax.syntaxSPARQL_11);
	
	public static Query createPropertyQuery(List<Node> nodes) {
		Query result = (Query)propertyAdjancencyQuery.clone();
		
		ExprList exprList = new ExprList();
		for(Node node : nodes) {
			exprList.add(NodeValue.makeNode(node));
		}
		
		ExprVar exprVar = new ExprVar("p1");
		E_OneOf expr = new E_OneOf(exprVar, exprList);
		ElementFilter filter = new ElementFilter(expr);
		
		//ElementU
		Element tmp = result.getQueryPattern();
		List<Element> elements = ElementUtils.toElementList(tmp);
		
		elements.add(filter);
		
		ElementGroup element = new ElementGroup();
		element.addElement(tmp);
		element.addElement(filter);
		
		result.setQueryPattern(element);
		
		return result;
	}
	
	public static void main(String[] args) throws ClassNotFoundException, SQLException {
		//String outer = "Select ?p1 (Count(*) As ?c) { ?s ?p1 ?o } Group By ?p1 Order By Asc(?c)";
	    String outer = "Select ?p1 (Count(*) As ?c) { ?s ?p1 ?o . ?p1 a rdf:Property . } Group By ?p1 Order By Asc(?c)";
		
		long timeToLive = 360l * 24l * 60l * 60l * 1000l; 
		CacheCoreEx cacheBackend = CacheCoreH2.create("sparql", timeToLive, true);
		CacheEx cacheFrontend = new CacheExImpl(cacheBackend);

		//String endpointUrl = "http://dbpedia.org/sparql";
		String endpointUrl = "http://cstadler.aksw.org/vos-freebase/sparql";
		Set<String> defaultGraphs = new HashSet<String>(Arrays.asList("http://freebase.com/2013-09-22"));
		
		
		QueryExecutionFactory qef1 = new QueryExecutionFactoryHttp(endpointUrl, defaultGraphs);
		qef1 = new QueryExecutionFactoryDelay(qef1, 10000l);
		qef1 = new QueryExecutionFactoryRetry(qef1, 5, 30000l);
		qef1 = new QueryExecutionFactoryCacheEx(qef1, cacheFrontend);
		
		
		QueryExecutionFactory qef2 = new QueryExecutionFactoryHttp(endpointUrl, defaultGraphs);
		qef2 = new QueryExecutionFactoryDelay(qef2, 10000l);
		qef2 = new QueryExecutionFactoryRetry(qef2, 5, 30000l);
		qef2 = new QueryExecutionFactoryPaginated(qef2, 1000);
		qef2 = new QueryExecutionFactoryCacheEx(qef2, cacheFrontend);
	
		
		QueryExecution qe = qef1.createQueryExecution(outer);
		ResultSet rs = qe.execSelect();
		
		
		List<Node> batch = new ArrayList<Node>();
		long batchTripleCount = 0;

		Var p1 = Var.alloc("p1");
		//Var p2 = Var.alloc("p2");
		Var c = Var.alloc("c");
		while(rs.hasNext()) {
			Binding binding = rs.nextBinding();
			
			Node node = binding.get(p1);
			Long count = Long.parseLong("" + binding.get(c).getLiteralValue());
			
			Long tmpCount = batchTripleCount + count;
			
			List<Node> tmpBatch = new ArrayList<Node>(batch);
			tmpBatch.add(node);

			
			//batch.remove(index)

			Query query = createPropertyQuery(tmpBatch);
			String queryStr = "" + query;

			if(queryStr.length() > 2000 || tmpCount > 1000000 || (!rs.hasNext() && tmpBatch.isEmpty())) {
				
				System.out.println("Batch size: " + tmpBatch.size() + ", tripleCount; " + tmpCount);
				System.out.println(query);
				
				QueryExecution qe2 = qef1.createQueryExecution(query);
				ResultSet rs2 = qe2.execSelect();
				while(rs2.hasNext()) {
					Binding binding2 = rs2.nextBinding();
					System.out.println(binding2);
					
				}
				
				
				batch = new ArrayList<Node>();
				batchTripleCount = 0;
				
			} else {
				batchTripleCount = tmpCount;
				batch = tmpBatch;
			}
			
			
			//System.out.println(node);
		}
		
	}
}
