package org.aksw.jassa.sparql_path.core.algorithm;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.aksw.jassa.sparql_path.core.BreathFirstTask;
import org.aksw.jassa.sparql_path.core.NeighborProvider;
import org.aksw.jassa.sparql_path.core.NeighborProviderModel;
import org.aksw.jassa.sparql_path.core.PathCallbackList;
import org.aksw.jassa.sparql_path.core.PathConstraint;
import org.aksw.jassa.sparql_path.core.VocabPath;
import org.aksw.jassa.sparql_path.core.domain.Concept;
import org.aksw.jassa.sparql_path.core.domain.Path;
import org.aksw.jassa.sparql_path.core.domain.Step;
import org.aksw.jassa.sparql_path.utils.QueryExecutionUtils;
import org.aksw.jassa.sparql_path.utils.QueryGenerationUtils;
import org.aksw.jassa.sparql_path.utils.VarUtils;
import org.aksw.jena_sparql_api.core.QueryExecutionFactory;
import org.aksw.jena_sparql_api.model.QueryExecutionFactoryModel;
import org.aksw.sparqlify.core.algorithms.GeneratorBlacklist;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.hp.hpl.jena.graph.Node;
import com.hp.hpl.jena.graph.Triple;
import com.hp.hpl.jena.query.Query;
import com.hp.hpl.jena.query.QueryExecution;
import com.hp.hpl.jena.query.QuerySolution;
import com.hp.hpl.jena.query.ResultSet;
import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ModelFactory;
import com.hp.hpl.jena.rdf.model.Resource;
import com.hp.hpl.jena.rdf.model.Statement;
import com.hp.hpl.jena.sdb.core.Generator;
import com.hp.hpl.jena.sdb.core.Gensym;
import com.hp.hpl.jena.sparql.expr.E_Equals;
import com.hp.hpl.jena.sparql.expr.ExprVar;
import com.hp.hpl.jena.sparql.syntax.Element;
import com.hp.hpl.jena.sparql.syntax.ElementFilter;
import com.hp.hpl.jena.sparql.syntax.ElementGroup;
import com.hp.hpl.jena.sparql.syntax.PatternVars;

public class ConceptPathFinder {
 
    private static final Logger logger = LoggerFactory.getLogger(ConceptPathFinder.class);
   
    
	public static ResultSet getPropertyAdjacency(QueryExecutionFactory qef) {
		String queryStr = "Select Distinct ?x ?y { ?a ?x ?b . ?b ?y ?c }";
		QueryExecution qe = qef.createQueryExecution(queryStr);
		ResultSet result = qe.execSelect();

		return result;
	}
	
	public static List<Path> findPaths(QueryExecutionFactory qef, Concept sourceConcept, Concept tmpTargetConcept) {

		
		Concept targetConcept = tmpTargetConcept.makeDistinctFrom(sourceConcept);
		
		logger.debug("Distinguished target concept: " + targetConcept);
		

		//PathConstraint.getPathConstraintsSimple(targetConcept);
		
		//UndirectedGraph<String, EdgeTransition> transitionGraph = new SimpleGraph<String, EdgeTransition>(EdgeTransition.class);

		Model joinSummaryModel = ModelFactory.createDefaultModel();
		
        ResultSet rs = getPropertyAdjacency(qef);
		while(rs.hasNext()) {
			QuerySolution qs = rs.next();
			
			Resource x = qs.getResource("x");
			Resource y = qs.getResource("y");
			
			joinSummaryModel.add(x, VocabPath.joinsWith, y);
			
			
//			String x = qs.get("x").asNode().getURI();
//			String y = qs.get("y").asNode().getURI();

			
			
			//System.out.println(x + "   " + y);
			//transitionGraph.addVertex(arg0);
		}
		logger.debug("Join summary model contains " + joinSummaryModel.size() + " triples");
		
		
		// Retrieve properties of the source concept
		// Example: If our source concept is ?s a Type", we do not know which properties the concept has

		Concept propertyConcept = QueryGenerationUtils.createPropertyQuery(sourceConcept);
		Query propertyQuery = propertyConcept.asQuery();
		logger.debug("Property query: " + propertyQuery);


		List<Node> nodes = QueryExecutionUtils.executeList(qef, propertyQuery);
		logger.debug("Retrieved " + nodes.size() + " properties: " + nodes);

		
		// Add the start node to the transition model
		for(Node node : nodes) {
			Triple triple = new Triple(VocabPath.start.asNode(), VocabPath.joinsWith.asNode(), node);

			
//			System.out.println("JoinSummaryTriple: " + triple);
			Statement stmt = joinSummaryModel.asStatement(triple);
			joinSummaryModel.add(stmt);
		}
		
		QueryExecutionFactory qefMeta = new QueryExecutionFactoryModel(joinSummaryModel);
		
		// Now transform the target query so the find candidate nodes in the transition graph
		
		// Essentially:
		// ?moo prop1 ?foo . ?foo prop 2 ?bar .
		// becomes
		// Select ?s { ?s connectsTo ?prop1 . ?prop1 connectsTo ?foo }
		// In other words: we take the target concept, extract all quads
		
		//String test = "Prefix o:<http://foo.bar/> Prefix geo:<http://www.w3.org/2003/01/geo/wgs84_pos#> Select ?s { ?s o:connectsTo geo:long ; o:connectsTo geo:lat }";

		Concept targetCandidateConcept = PathConstraint.getPathConstraintsSimple(targetConcept);
		Query targetCandidateQuery = targetCandidateConcept.asQuery();
		
		//Query query = QueryFactory.create(test);
        logger.debug("TargetCandidateQuery: " + targetCandidateQuery);
        List<Node> candidates = QueryExecutionUtils.executeList(qefMeta, targetCandidateQuery);
		logger.debug("Got " + candidates.size() + " candidates: " + candidates);

		
		// Now that we know the candidates, we can start with out breath first search
		
		//DataSource ds = BreathFirstTask.createDb();
		
		
		PathCallbackList callback = new PathCallbackList();

		for(Node candidate : candidates) {
			Resource dest = joinSummaryModel.asRDFNode(candidate).asResource();
			
			
			
			NeighborProvider<Resource> np = new NeighborProviderModel(joinSummaryModel);

			BreathFirstTask.run(np, VocabPath.start, dest, new ArrayList<Step>(), callback);
			//BreathFirstTask.runFoo(np, VocabPath.start, dest, new ArrayList<Step>(), new ArrayList<Step>(), callback);
		}
		
		
		List<Path> paths = callback.getCandidates();
		
		// Cross check whether the path actually connects the source and target concepts
		Set<String> varNames = new HashSet<String>();
		varNames.addAll(VarUtils.getVarNames(PatternVars.vars(sourceConcept.getElement())));
		varNames.addAll(VarUtils.getVarNames(PatternVars.vars(targetConcept.getElement())));
		
		Generator generator = GeneratorBlacklist.create(Gensym.create("v"), varNames);
		
		List<Path> result = new ArrayList<Path>();
		
		for(Path path : paths) {
			List<Element> pathElements = Path.pathToElements(path, sourceConcept.getVar(), targetConcept.getVar(), generator);
			
			List<Element> tmp = new ArrayList<Element>();
			if(!sourceConcept.isSubjectConcept()) {
			    tmp.addAll(sourceConcept.getElements());
			}
			
			if(!targetConcept.isSubjectConcept()) {
			    tmp.addAll(targetConcept.getElements());
			}

			tmp.addAll(pathElements);

			if(pathElements.isEmpty()) {
				if(!sourceConcept.getVar().equals(targetConcept.getVar())) {
					tmp.add(new ElementFilter(new E_Equals(new ExprVar(sourceConcept.getVar()), new ExprVar(targetConcept.getVar()))));
				}
			}

			ElementGroup group = new ElementGroup();
			for(Element t : tmp) {
				group.addElement(t);
			}
			
			Query query = new Query();
			query.setQueryAskType();
			query.setQueryPattern(group);
			
			logger.debug("Verifying candidate with query: " + query);
			
			QueryExecution xqe = qef.createQueryExecution(query);
			boolean isCandidate = xqe.execAsk();
			logger.debug("Verification result is [" + isCandidate + "] for " + query);
			
			if(isCandidate) {
				result.add(path);
			}
		}
		
		return result;
	}

}
