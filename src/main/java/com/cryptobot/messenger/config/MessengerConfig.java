package com.cryptobot.messenger.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class MessengerConfig {

    // Mapper Bean
    @Bean
    public ObjectMapper getMapper() {
        return new ObjectMapper();
    }

    // Rest Template
    @Bean
    public RestTemplate getRestTemplate() {
        return new RestTemplate();
    }

}
