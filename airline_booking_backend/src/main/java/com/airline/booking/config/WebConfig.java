package com.airline.booking.config;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.List;

@Configuration
public class WebConfig implements WebMvcConfigurer {
   
   @Bean
   public ObjectMapper objectMapper() {
       ObjectMapper objectMapper = new ObjectMapper();
       
       // Register module for Java 8 date/time
       objectMapper.registerModule(new JavaTimeModule());
       
       // Disable features that could cause issues
       objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
       objectMapper.disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);
       
       // Exclude properties that are null to reduce JSON size
       objectMapper.setSerializationInclusion(JsonInclude.Include.NON_NULL);
       
       // Do not fail when encountering unknown properties
       objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
       
       return objectMapper;
   }
   
   @Bean
   public MappingJackson2HttpMessageConverter mappingJackson2HttpMessageConverter() {
       MappingJackson2HttpMessageConverter jsonConverter = new MappingJackson2HttpMessageConverter();
       jsonConverter.setObjectMapper(objectMapper());
       return jsonConverter;
   }
   
   @Override
   public void configureMessageConverters(List<HttpMessageConverter<?>> converters) {
       converters.add(mappingJackson2HttpMessageConverter());
   }
   
   // Configure CORS
   @Override
   public void addCorsMappings(CorsRegistry registry) {
       // Replace "*" with your actual allowed origins
       registry.addMapping("/api/**")
           .allowedOrigins("http://localhost:3000")  // Allow only this origin
           .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
           .allowedHeaders("*")
           .allowCredentials(true)  // Allow credentials (cookies, authorization headers)
           .maxAge(3600);  // Cache preflight request for 1 hour (3600 seconds)
   }
}
