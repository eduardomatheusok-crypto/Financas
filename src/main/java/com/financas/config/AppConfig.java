package com.financas.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class AppConfig { // comunicação com api do gemini

    @Bean
    public RestTemplate restTemplate(){
        return new RestTemplate();
    }
}
