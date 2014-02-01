package org.aksw.jassa.sparql_path.core;

import java.util.Set;

// TODO Don't like this right now: The iterator should return steps I guess....
public interface NeighborProvider<T> {
    Set<T> getSuccessors(T r);
    Set<T> getPredecessors(T r);

//	ExtendedIterator<T> getSuccessors(T r);
//	ExtendedIterator<T> getPredecessors(T r);
}