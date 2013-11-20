package org.aksw.jassa.sparql_path.core;

import com.hp.hpl.jena.util.iterator.ExtendedIterator;

// TODO Don't like this right now: The iterator should return steps I guess....
public interface NeighborProvider<T> {
	ExtendedIterator<T> getSuccessors(T r);
	ExtendedIterator<T> getPredecessors(T r);
}