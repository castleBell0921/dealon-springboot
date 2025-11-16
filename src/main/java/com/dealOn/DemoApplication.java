package com.dealOn;

import java.util.TimeZone;

import javax.annotation.PostConstruct;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;

import io.github.cdimascio.dotenv.Dotenv;

@SpringBootApplication(exclude = {SecurityAutoConfiguration.class})
public class DemoApplication {
	
	@PostConstruct
    public void started() {
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Seoul"));
    }
	
	public static void main(String[] args) {
		Dotenv dotenv = Dotenv.load();
		/*
		 * System.setProperty("COOLSMS_API_KEY", dotenv.get("COOLSMS_API_KEY"));
		 * System.setProperty("COOLSMS_API_SECRET", dotenv.get("COOLSMS_API_SECRET"));
		 * System.setProperty("COOLSMS_FROM_PHONE", dotenv.get("COOLSMS_FROM_PHONE"));
		 * System.setProperty("SPRING_DATASOURCE_URL",
		 * dotenv.get("SPRING_DATASOURCE_URL"));
		 * System.setProperty("SPRING_DATASOURCE_USERNAME",
		 * dotenv.get("SPRING_DATASOURCE_USERNAME"));
		 * System.setProperty("SPRING_DATASOURCE_PASSWORD",
		 * dotenv.get("SPRING_DATASOURCE_PASSWORD"));
		 * System.setProperty("SPRING_DATASOURCE_URL",
		 * dotenv.get("SPRING_DATASOURCE_URL"));
		 * System.setProperty("SPRING_DATASOURCE_DRIVER_CLASS_NAME",
		 * dotenv.get("SPRING_DATASOURCE_DRIVER_CLASS_NAME"));
		 */
		dotenv.entries().forEach(entry ->
		System.setProperty(entry.getKey(), entry.getValue())
	);
		
		SpringApplication.run(DemoApplication.class, args);
	}

}
