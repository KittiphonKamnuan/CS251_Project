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
       
       // ลงทะเบียนโมดูลสำหรับ Java 8 date/time
       objectMapper.registerModule(new JavaTimeModule());
       
       // ปิดการใช้งานคุณสมบัติที่อาจทำให้เกิดปัญหา
       objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
       objectMapper.disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);
       
       // ไม่รวมคุณสมบัติที่เป็น null เพื่อลดขนาด JSON
       objectMapper.setSerializationInclusion(JsonInclude.Include.NON_NULL);
       
       // ไม่ล้มเหลวเมื่อพบคุณสมบัติที่ไม่รู้จัก
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
   
   // กำหนดค่า CORS
   @Override
   public void addCorsMappings(CorsRegistry registry) {
       registry.addMapping("/api/**")
           .allowedOrigins("*")
           .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
           .allowedHeaders("*")
           .maxAge(3600);
   }
}