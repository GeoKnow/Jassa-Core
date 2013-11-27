package org.aksw.jassa.web.main;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.ServletRegistration;

import org.springframework.web.WebApplicationInitializer;
import org.springframework.web.context.ContextLoaderListener;
import org.springframework.web.context.request.RequestContextListener;
import org.springframework.web.context.support.AnnotationConfigWebApplicationContext;
import org.springframework.web.servlet.DispatcherServlet;

import com.sun.jersey.spi.spring.container.servlet.SpringServlet;


public class WebAppInitializer
	implements WebApplicationInitializer
{
	@Override
	public void onStartup(ServletContext servletContext)
		throws ServletException
	{		
		// Create the 'root' Spring application context
		AnnotationConfigWebApplicationContext rootContext = new AnnotationConfigWebApplicationContext();
		rootContext.register(AppConfig.class);
		
		// Manage the lifecycle of the root application context
		servletContext.addListener(new ContextLoaderListener(rootContext));
		servletContext.addListener(new RequestContextListener());
				
		// Create the dispatcher servlet's Spring application context
		AnnotationConfigWebApplicationContext dispatcherContext = new AnnotationConfigWebApplicationContext();
		dispatcherContext.register(WebMvcConfig.class);
		
		ServletRegistration.Dynamic adminServlet = servletContext.addServlet("jassa-api", new SpringServlet());
		adminServlet.setInitParameter("com.sun.jersey.config.property.packages", "org.aksw.jassa.web.api");
		adminServlet.addMapping("/api/*");
		adminServlet.setLoadOnStartup(1);
		
//		ServletRegistration.Dynamic endpointServlet = servletContext.addServlet("sparqlify-endpoints", new SpringServlet());
//		endpointServlet.setInitParameter("com.sun.jersey.config.property.packages", "org.aksw.sparqlify.admin.web.endpoint");
//		endpointServlet.setLoadOnStartup(1);
//		endpointServlet.addMapping("/services/*");
//		
//		// Register and map the dispatcher servlet
//		ServletRegistration.Dynamic dispatcherServlet = servletContext.addServlet("sparqlify-dispatcher", new DispatcherServlet(dispatcherContext));
//		//dispatcherServlet.set
////		dispatcherServlet.addMapping("");
//		dispatcherServlet.addMapping("*.do");
//		//dispatcherServlet.addMapping("/**");
//		dispatcherServlet.setLoadOnStartup(1);
	}	
}
