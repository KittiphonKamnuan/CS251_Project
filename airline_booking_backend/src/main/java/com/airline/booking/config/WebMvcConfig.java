package com.airline.booking.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.lang.NonNull;

import java.nio.charset.StandardCharsets;
import java.util.List;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {
    @Override
    public void extendMessageConverters(@NonNull List<HttpMessageConverter<?>> converters) {
        for (HttpMessageConverter<?> converter : converters) {
            if (converter instanceof MappingJackson2HttpMessageConverter) {
                MappingJackson2HttpMessageConverter jsonConverter = (MappingJackson2HttpMessageConverter) converter;
                jsonConverter.setDefaultCharset(StandardCharsets.UTF_8);
                jsonConverter.setSupportedMediaTypes(List.of(
                    MediaType.APPLICATION_JSON,
                    new MediaType("application", "json", StandardCharsets.UTF_8),
                    new MediaType("application", "*+json", StandardCharsets.UTF_8)
                ));
            }
        }
    }
}
