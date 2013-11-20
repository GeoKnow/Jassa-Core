package org.aksw.jassa.sparql_path.core;

import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.RDFNode;
import com.hp.hpl.jena.rdf.model.Resource;
import com.hp.hpl.jena.rdf.model.Statement;
import com.hp.hpl.jena.util.iterator.ExtendedIterator;

public class NeighborProviderModel
	implements NeighborProvider<Resource>
{
	private Model model;

	public static ExtendedIterator<Resource> createForwardIterator(Model model, Resource start) {
		// For the current resource, get all possible outgoing paths
		ExtendedIterator<Statement> itTmp = model.listStatements(start, VocabPath.connectsTo, (RDFNode)null);
		ExtendedIterator<Resource> result = itTmp.mapWith(new Map1StatementToObject());
		
		return result;
	}
	
	public static ExtendedIterator<Resource> createBackwardIterator(Model model, Resource start) {
		// For the current resource, get all possible outgoing paths
		ExtendedIterator<Statement> itTmp = model.listStatements(null, VocabPath.connectsTo, start);
		ExtendedIterator<Resource> result = itTmp.mapWith(new Map1StatementToObject());
		
		return result;
	}

	
	public NeighborProviderModel(Model model) {
		this.model = model;
	}

	@Override
	public ExtendedIterator<Resource> getSuccessors(Resource r) {
		return createForwardIterator(model, r);
	}

	@Override
	public ExtendedIterator<Resource> getPredecessors(Resource r) {
		return createBackwardIterator(model, r);
	}
}