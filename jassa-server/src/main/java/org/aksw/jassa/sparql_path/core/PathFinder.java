package org.aksw.jassa.sparql_path.core;

import java.util.List;

import org.aksw.jassa.sparql_path.core.domain.Concept;
import org.aksw.sparqlify.core.ReplaceConstants;
import org.aksw.sparqlify.database.FilterPlacementOptimizer2;
import org.slf4j.Logger;

import com.hp.hpl.jena.query.Query;
import com.hp.hpl.jena.sparql.algebra.Algebra;
import com.hp.hpl.jena.sparql.algebra.Op;
import com.hp.hpl.jena.sparql.algebra.op.OpProject;
import com.hp.hpl.jena.sparql.core.Var;

public class PathFinder {

	/**
	 * A concept may already make use of a set of paths, e.g.
	 * 
	 * ?s a Project
	 * ?s hasFunding ?f .
	 *     ?f hasPartner ?p .
	 *         ?p hasAddress ?a .
	 *             ?a hasCountry ?c .
	 *             Filter(?c = Germany)
	 * 
	 * So now the question is, what paths are there which lead to a geo-concept -
	 * i.e. a set of resources that carry geo-coordinates?
	 * 
	 * 
	 * 
	 * @param a
	 * @param b
	 */
	public static void findPaths(Concept a, Concept b) {
		
		Logger logger = null;
		Query query = null;
		
		Op op = Algebra.compile(query);
		op = Algebra.toQuadForm(op);		
		
		
		//op = FilterPlacementOptimizer.optimize(op);
		
		// Add a projection if the query contains a result star
		// in order to filter out auto-generated variables
		if(query.isSelectType() && query.isQueryResultStar()) {
			List<Var> vars = query.getProjectVars();
			op = new OpProject(op, vars);
		}
		
		
		
		//Set<OpRdfViewPattern> result = getApplicableViews(op);
		//Set<OpRdfViewPattern> result = getApplicableViews(op);
		
		//TransformFilterPlacement transformer = new TransformFilterPlacement();

		//op.(transformer);

		logger.warn("JENA'S ALGEBRA OPTIMIZATION DISABLED");
//		op = Algebra.optimize(op);
//		logger.debug("[Algebra] Jena Optimized: " + op);

		op = ReplaceConstants.replace(op);
		//logger.debug("[Algebra] ConstantsEleminated: " + op);

		// Note:
		// OpAssign: The assignments end up in a mapping's variable definition
		// I guess it is valid to convert them to OpExtend
		
		
		
		Op augmented = null;
		//Op augmented = _getApplicableViews(op);
		//logger.debug("[Algebra] View Candidates: " + augmented);

		
		Op optimizedFilters = FilterPlacementOptimizer2.optimize(augmented);
		
		//logger.debug("[Algebra] Filter Placement Optimized: " + optimizedFilters);
		//System.out.println(optimizedFilters);
		
		//Op result = augmented;
		Op result = optimizedFilters;
		
		//System.out.println("Algebra with optimized filters: " + result);
		
		//return result;

	}
}
