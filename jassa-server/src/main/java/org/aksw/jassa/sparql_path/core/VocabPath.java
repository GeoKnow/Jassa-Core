package org.aksw.jassa.sparql_path.core;

import com.hp.hpl.jena.rdf.model.Property;
import com.hp.hpl.jena.rdf.model.Resource;
import com.hp.hpl.jena.rdf.model.ResourceFactory;

public class VocabPath {
	public static final Resource start = ResourceFactory.createProperty("http://foo.bar/start");
	public static final Property connectsTo = ResourceFactory.createProperty("http://foo.bar/connectsTo");
}