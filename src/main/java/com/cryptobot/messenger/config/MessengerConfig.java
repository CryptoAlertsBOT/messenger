package com.cryptobot.messenger.config;

import com.cryptobot.messenger.pipeline.Pipeline;
import com.cryptobot.messenger.platform.PlatformEnum;
import com.cryptobot.messenger.queue.model.Message;
import com.cryptobot.messenger.webhook.WebhookNotifier;
import com.cryptobot.messenger.webhook.models.WebHookEndpoint;
import com.cryptobot.messenger.webhook.service.WebhookEndpointService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rabbitmq.client.ConnectionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

import java.util.List;

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

    // ConnectionFactory
    @Bean
    public ConnectionFactory getConnectionFactory() {
        return new ConnectionFactory();
    }

/*    @Bean
    public Pipeline createPipeline(Message message) {
        List<PlatformEnum> platformEnums = message.getPlatforms();
        return new Pipeline(message, platformEnums);
    }*/




}
