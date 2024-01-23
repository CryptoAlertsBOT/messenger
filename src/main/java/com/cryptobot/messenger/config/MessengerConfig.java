package com.cryptobot.messenger.config;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rabbitmq.client.ConnectionFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class MessengerConfig {

    // Mapper Bean
    @Bean
    public ObjectMapper getMapper() {
        return new ObjectMapper().configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    }

    // Rest Template
    @Bean
    public RestTemplate getRestTemplate() {
        return new RestTemplate();
    }

    // ConnectionFactory
    @Bean
    public ConnectionFactory getConnectionFactory() {
        return new ConnectionFactory();
    }

}
