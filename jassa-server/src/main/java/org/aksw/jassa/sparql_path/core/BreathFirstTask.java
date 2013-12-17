package org.aksw.jassa.sparql_path.core;

import java.io.IOException;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import javax.sql.DataSource;

import org.aksw.commons.util.StreamUtils;
import org.aksw.jassa.sparql_path.core.domain.Path;
import org.aksw.jassa.sparql_path.core.domain.Step;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;

import com.google.common.base.Function;
import com.hp.hpl.jena.graph.Node;
import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.RDFNode;
import com.hp.hpl.jena.rdf.model.Resource;
import com.hp.hpl.jena.rdf.model.Statement;
import com.hp.hpl.jena.util.iterator.ExtendedIterator;


/**
 * There is a callback for getting notified about found paths.
 * 
 * @author raven
 *
 */
public class BreathFirstTask {
	private Model model;
	
	private Node a;
	private Node b;
	
	private Set<Resource> sourceFront;
	private Set<Resource> targetFront;
	
	private Function<Void, Void> callback;
	
	public BreathFirstTask()
	{
	}

	public static ExtendedIterator<Resource> createForwardIterator(Model model, Resource start) {
		// For the current resource, get all possible outgoing paths
		ExtendedIterator<Statement> itTmp = model.listStatements(start, VocabPath.joinsWith, (RDFNode)null);
		ExtendedIterator<Resource> result = itTmp.mapWith(new Map1StatementToObject());
		
		return result;
	}


	public static ExtendedIterator<Resource> createBackwardIterator(Model model, Resource start) {
		// For the current resource, get all possible outgoing paths
		ExtendedIterator<Statement> itTmp = model.listStatements(null, VocabPath.joinsWith, start);
		ExtendedIterator<Resource> result = itTmp.mapWith(new Map1StatementToObject());
		
		return result;
	}
	
	public static void run(NeighborProvider<Resource> np, Resource start, Resource dest, List<Step> steps, PathCallback callback) {
		
		if(start.equals(dest)) {
			// emit empty path
			callback.handle(new Path(steps));
			return;
		}

		if(steps.size() > 6) {
			return;
		}

		// Note: There is 2x2 possibilities per step:
		// .) we move forward from the source / backward from the dest
		// .) we move backward from the source / forward to the dest
		
		
		// The decision on whether to start from the front or the back can depend on which node leads to
		// fewer options
		Set<Resource> succs = np.getSuccessors(start).toSet();
		for(Resource succ : succs) {
			List<Step> tmp = new ArrayList<Step>(steps);
			
			Step s = new Step(succ.getURI(), false);
			tmp.add(s);
			
			run(np, succ, dest, tmp, callback);
		}

	}


	public static void runFoo(NeighborProvider<Resource> np, Resource start, Resource dest, List<Step> startSteps, List<Step> destSteps, PathCallback callback) {
		
		List<Step> steps = null;
		
		if(start.equals(dest)) {
			// emit empty path
			callback.handle(new Path(steps));
		}

		if(startSteps.size() + destSteps.size() > 10) {
			return;
		}

		// Note: There is 2x2 possibilities per step:
		// .) we move forward from the source / backward from the dest
		// .) we move backward from the source / forward to the dest
		
		
		// The decision on whether to start from the front or the back can depend on which node leads to
		// fewer options
		Set<Resource> succs = np.getSuccessors(start).toSet();
		Set<Resource> preds = np.getPredecessors(dest).toSet();

		
		if(preds.size() < succs.size()) {
			
			
			
		}
		
		// NOTE: We could now take the smaller set to make another step

		for(Resource succ : succs) {
			List<Step> tmp = new ArrayList<Step>(steps);
			
			Step s = new Step(succ.getURI(), false);
			tmp.add(s);

			/*
			if(succ.equals(dest)) {
				callback.handle(new Path(new ArrayList<Step>(tmp)));
			}*/
			
			//run(np, succ, dest, tmp, callback);
		}
		
		
		for(Resource pred : preds) {
			
		}
		
	}
	
	
	

	/*
	public static isSolution() {
		
	}
	*/
	
	public static DataSource createDb() throws IOException, SQLException {
		DataSource ds = null;// SparqlifyUtils.createDefaultDatabase("paths");

		PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
		org.springframework.core.io.Resource r = resolver.getResource("paths.sql");
		
		InputStream in = r.getInputStream();
		String str = StreamUtils.toStringSafe(in);
		
		Connection conn = ds.getConnection();
		try {
			conn.createStatement().executeUpdate(str);
		}
		finally {
			conn.close();
		}
		
		return ds;
	}
	
	public static void doSomething(Model model, Resource start, Resource end) {

		Set<Resource> visited = new HashSet<Resource>();
		
		Resource current = null;		
		visited.add(current);

		}
		
		
//		// Go forward and backward from the current concept
//		// The take step function checks 
//		takeStep(a, false);
//		takeStep(a, true);
//
//		takeStep(b, false);
//		takeStep(b, true);
//
//		
//		
//		
//		while(it.hasNext()) {
//			Resource node = it.next();
//		}
		
//	}
}