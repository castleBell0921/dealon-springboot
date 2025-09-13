package com.dealOn.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.thymeleaf.templatemode.TemplateMode;
import org.thymeleaf.templateresolver.ClassLoaderTemplateResolver;

@Configuration

public class TemplatesResolver{

	@Bean
	public ClassLoaderTemplateResolver userResolver() {
		ClassLoaderTemplateResolver uResolver = new ClassLoaderTemplateResolver();

		uResolver.setPrefix("templates/user/");
		uResolver.setSuffix(".html");
		uResolver.setTemplateMode(TemplateMode.HTML);
		uResolver.setCharacterEncoding("UTF-8");
		uResolver.setCacheable(false);
		uResolver.setCheckExistence(true);
		return uResolver;
	}

	@Bean
	public ClassLoaderTemplateResolver productResolver() {
		ClassLoaderTemplateResolver pResolver = new ClassLoaderTemplateResolver();

		pResolver.setPrefix("templates/product/");
		pResolver.setSuffix(".html");
		pResolver.setTemplateMode(TemplateMode.HTML);
		pResolver.setCharacterEncoding("UTF-8");
		pResolver.setCacheable(false);
		pResolver.setCheckExistence(true);
		return pResolver;
	}
}
