package com.fragrance.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.util.HashMap;
import java.util.Map;

/**
 * Loads environment variables from .env file into Spring's environment
 * This runs before application.properties is loaded
 */
public class DotenvConfig implements ApplicationContextInitializer<ConfigurableApplicationContext> {

    @Override
    public void initialize(ConfigurableApplicationContext applicationContext) {
        try {
            Dotenv dotenv = Dotenv.configure()
                    .ignoreIfMissing() // Don't fail if .env is missing
                    .load();

            ConfigurableEnvironment environment = applicationContext.getEnvironment();
            Map<String, Object> envMap = new HashMap<>();

            // Load all .env variables into Spring environment
            dotenv.entries().forEach(entry -> {
                envMap.put(entry.getKey(), entry.getValue());
            });

            environment.getPropertySources()
                    .addFirst(new MapPropertySource("dotenvProperties", envMap));

        } catch (Exception e) {
            // .env file not found or error loading - continue with default values
            System.out.println("Warning: .env file not found. Using default configuration.");
        }
    }
}
