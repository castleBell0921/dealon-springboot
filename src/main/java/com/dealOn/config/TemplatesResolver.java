package com.dealOn.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.thymeleaf.templatemode.TemplateMode;
import org.thymeleaf.templateresolver.ClassLoaderTemplateResolver;

@Configuration
public class TemplatesResolver{
	
	@Bean
	public ClassLoaderTemplateResolver commResolver() {
		ClassLoaderTemplateResolver commResolver = new ClassLoaderTemplateResolver();
		commResolver.setPrefix("templates/views/Community/");
		commResolver.setSuffix(".html");
		commResolver.setTemplateMode(TemplateMode.HTML);
		commResolver.setCharacterEncoding("UTF-8");
		commResolver.setCacheable(false);
		commResolver.setCheckExistence(true);
		return commResolver;
	}
}
