package org.aksw.jassa.web.api;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import javax.ws.rs.GET;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;

import org.aksw.facete.web.api.domain.ConceptDesc;
import org.aksw.facete.web.api.domain.PathDesc;
import org.aksw.facete.web.api.domain.ServiceDesc;
import org.aksw.jassa.sparql_path.core.algorithm.ConceptPathFinder;
import org.aksw.jassa.sparql_path.core.domain.Concept;
import org.aksw.jassa.sparql_path.core.domain.Path;
import org.aksw.jena_sparql_api.cache.extra.CacheCoreEx;
import org.aksw.jena_sparql_api.cache.extra.CacheCoreH2;
import org.aksw.jena_sparql_api.cache.extra.CacheEx;
import org.aksw.jena_sparql_api.cache.extra.CacheExImpl;
import org.aksw.jena_sparql_api.core.QueryExecutionFactory;
import org.aksw.jena_sparql_api.http.QueryExecutionFactoryHttp;

import com.google.gson.Gson;


@javax.ws.rs.Path("/path-finding")
public class PathFindingApi {

	//private static final Map<ServiceDesc, >
	
	
	private static CacheEx cacheFrontend = null;
	
	public static CacheEx createCache() throws ClassNotFoundException, SQLException {

		long timeToLive = 360l * 24l * 60l * 60l * 1000l; 
        CacheCoreEx cacheBackend = CacheCoreH2.create(true, "/tmp/facete-server/cache/sparql", "spar777ql", timeToLive, true);
        CacheEx cacheFrontend = new CacheExImpl(cacheBackend);

        return cacheFrontend;
	}
	
	public static QueryExecutionFactory createQef(ServiceDesc service) throws ClassNotFoundException, SQLException {

		// TODO The cache configuration needs to be injected from the outside, e.g. a debian package that gets deployed.
		// Or an admin interface that is shown on first start (like mediawiki, wordpress, etc)
//		if(cacheFrontend == null) {
//			synchronized(PathFindingApi.class) {
//				if(cacheFrontend == null) {
//					cacheFrontend = createCache();
//				}
//			}
//		}


        //QueryExecutionFactory qef = new QueryExecutionFactoryHttp(service.getServiceIri(), service.getDefaultGraphIris());
        //qef = new QueryExecutionFactoryDelay(qef, 10000l); // 10 second delay between queries
        //qef = new QueryExecutionFactoryRetry(qef, 5, 60000l); // 5 retries, 60 second delay between retries
        //qef = new QueryExecutionFactoryCacheEx(qef, cacheFrontend);
		
		QueryExecutionFactory result = new QueryExecutionFactoryHttp(service.getServiceIri(), service.getDefaultGraphIris());
		
		return result;
	}
	
	
	/**
	 * Input: A JSon object with the fields:
	 * {
	 *     service: { serviceIri: '', defaultGraphIris: [] }
	 *     sourceConcept: { elementStr: '', varName: '' }
	 *     targetConcept: 
	 * }
	 * 
	 * 
	 * @param serviceDesc A json object describing the service.
	 * @param startConcept
	 * @param destConcept
	 * @return
	 * @throws SQLException 
	 * @throws ClassNotFoundException 
	 */
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public String findPaths(@QueryParam("query") String json) throws ClassNotFoundException, SQLException {
		Gson gson = new Gson();
		PathDesc pathDesc = gson.fromJson(json, PathDesc.class);
		
		ConceptDesc sourceDesc = pathDesc.getSourceConcept();		
		Concept sourceConcept = Concept.create(sourceDesc.getElementStr(), sourceDesc.getVarName());
		
		ConceptDesc targetDesc = pathDesc.getTargetConcept();		
		Concept targetConcept = Concept.create(targetDesc.getElementStr(), targetDesc.getVarName());
		
		ServiceDesc serviceDesc = pathDesc.getService();
		QueryExecutionFactory service = createQef(serviceDesc);
		
		List<Path> paths = ConceptPathFinder.findPaths(service, sourceConcept, targetConcept);
		
		List<String> tmp = new ArrayList<String>();
		for(Path path : paths) {
			tmp.add(path.toPathString());
		}
		
		String result = gson.toJson(tmp);
		return result;
	}
}
