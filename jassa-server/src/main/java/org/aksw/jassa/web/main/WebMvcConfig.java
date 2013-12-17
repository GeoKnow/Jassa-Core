package org.aksw.jassa.web.main;

import org.aksw.jena_sparql_api.cache.extra.CacheCoreEx;
import org.aksw.jena_sparql_api.cache.extra.CacheCoreH2;
import org.aksw.jena_sparql_api.cache.extra.CacheEx;
import org.aksw.jena_sparql_api.cache.extra.CacheExImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;



@Configuration
@EnableWebMvc
@ComponentScan(basePackages = "org.aksw.jassa.web.api")
public class WebMvcConfig
	extends WebMvcConfigurerAdapter
{
    @Bean
    public CacheEx sparqlCache() 
    {
        long timeToLive = 360l * 24l * 60l * 60l * 1000l; 
        CacheCoreEx cacheBackend;
        try {
            cacheBackend = CacheCoreH2.create(true, "/tmp/facete-server/cache/sparql", "sparql", timeToLive, true);
        }
        catch(Exception e) {
            throw new RuntimeException(e);
        }
        CacheEx result = new CacheExImpl(cacheBackend);

        return result;
    }
    
    @Bean
    @Autowired
    public SparqlServiceFactory sparqlServiceFactory(CacheEx sparqlCache) {
        SparqlServiceFactory result = new SparqlServiceFactoryImpl(sparqlCache);
        return result;
    }
}



//	@Autowired
//    private ServletContext servletContext;
//
//
//    @Override
//    public void addResourceHandlers(ResourceHandlerRegistry registry) {
//        registry.addResourceHandler("/resources/**").addResourceLocations("/resources/");
////        registry.addResourceHandler("/jsp/**").addResourceLocations("/jsp/");
////        registry.addResourceHandler("*.js").addResourceLocations("/resources/snorql/");
////        registry.addResourceHandler("/**/*.css").addResourceLocations("/resources/snorql/");
////        registry.addResourceHandler("/**/snorql.css").addResourceLocations("/resources/snorql/");
//    }
//
//
//    @Override
//    public void addViewControllers(ViewControllerRegistry registry) {
//        //registry.addViewController("").setViewName("index-sparqlify-web-manager");
////        registry.addViewController("/").setViewName("index-sparqlify-web-manager");
//        registry.addViewController("/index.do").setViewName("index-sparqlify-web-manager");
//    }
//    
//
////    @Bean
////    public ServletForwardingController endpointsFwdCtrl() {
////    	ServletForwardingController result = new ServletForwardingController();
////    	result.setServletName("sparqlify-endpoints");
////    	
////    	return result;
////    }
//    
////    @Bean
////    public SimpleUrlHandlerMapping urlMapping() {
////    	SimpleUrlHandlerMapping result = new SimpleUrlHandlerMapping();
////
//////    	ServletForwardingController fwd1 = new ServletForwardingController();
//////    	fwd1.setServletName("sparqlify-admin-api");
//////
//////
//////    	Map<String, Object> urlMap = new HashMap<String, Object>();
//////    	urlMap.put("/manager/*", fwd1);
//////    	urlMap.put("/endpoints/*", fwd2);
//////    	result.setUrlMap(urlMap);
////
////    	Properties mappings = new Properties();
////    	mappings.put("/endpoints/*", "endpointsFwdCtrl");
////    	
////    	result.setMappings(mappings);
////
////    	return result;
////    }
//
//
//    //http://spring.io/blog/2013/05/11/content-negotiation-using-spring-mvc/
//	@Override
//	public void configureContentNegotiation(ContentNegotiationConfigurer configurer) {
//		
//		Map<String, MediaType> mediaTypes = new HashMap<String, MediaType>();
//		mediaTypes.put("htm", MediaType.TEXT_HTML);
//		mediaTypes.put("html", MediaType.TEXT_HTML);
//		mediaTypes.put("json", MediaType.APPLICATION_JSON);
//		
//		
//		configurer.favorPathExtension(true);
//		configurer.favorParameter(true);
//		configurer.parameterName("mediaType");
//		configurer.ignoreAcceptHeader(false);
//		configurer.useJaf(false);
//		configurer.defaultContentType(MediaType.TEXT_HTML);
//		configurer.mediaTypes(mediaTypes);
//	}
//	
//	@Bean
//	public ViewResolver contentNegotiatingViewResolver(ContentNegotiationManager manager) {
//		// Define the view resolvers
//		List<ViewResolver> resolvers = new ArrayList<ViewResolver>();
//
//		resolvers.add(internalResourceViewResolverJsp());
//		//resolvers.add(urlBasedViewResolver());
//		//resolvers.add(internalResourceViewResolverHtml());
//		
//		// Create the CNVR plugging in the resolvers and the content-negotiation manager
//		ContentNegotiatingViewResolver resolver = new ContentNegotiatingViewResolver();
//		resolver.setViewResolvers(resolvers);
//		resolver.setContentNegotiationManager(manager);
//		return resolver;
//	}
//	
//	
//	public ViewResolver urlBasedViewResolver() {
//		UrlBasedViewResolver result = new InternalResourceViewResolverChainable();
////		result.setPrefix("/WEB-INF/jsp/");
////		result.setSuffix(".jsp");
////		result.setOrder(0);
//		return result;
//	}
//
//	
//	//@Bean(name="viewResolverJsp")
//	public InternalResourceViewResolver internalResourceViewResolverJsp() {
//		InternalResourceViewResolver result = new InternalResourceViewResolver();
//		result.setPrefix("/WEB-INF/jsp/");
//		result.setSuffix(".jsp");
//		result.setViewClass(JstlView.class);
////		result.setOrder(1);
//		return result;
//	}
//
//	//@Bean(name="viewResolverHtml")
//	public InternalResourceViewResolver internalResourceViewResolverHtml() {
//		InternalResourceViewResolver result = new InternalResourceViewResolverChainable();
//		result.setPrefix("/resources/");
//		result.setSuffix(".html");
////		result.setOrder(2);
//		return result;
//	}
//
//}
