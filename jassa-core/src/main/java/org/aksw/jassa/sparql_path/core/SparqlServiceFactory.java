package org.aksw.jassa.sparql_path.core;

import java.util.Collection;

import org.aksw.jena_sparql_api.core.QueryExecutionFactory;

public interface SparqlServiceFactory {
    QueryExecutionFactory createSparqlService(String serviceUri, Collection<String> defaultGraphUris);
}