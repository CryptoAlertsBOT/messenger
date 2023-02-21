package com.cryptobot.messenger.queue;

import com.cryptobot.messenger.kline.models.KlineData;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rabbitmq.client.ConnectionFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class NotificationConsumer {
    private final ConnectionFactory factory;
    private final ObjectMapper mapper;
    private static final Logger logger = LoggerFactory.getLogger(NotificationConsumer.class);

    @Autowired
    public NotificationConsumer(ConnectionFactory factory, ObjectMapper mapper) {
        this.factory = factory;
        this.mapper = mapper;
    }

    /**
     * Consumes messagess from RabbitMQ
     */
    public void consume() {}


    /**
     * DeSerialize KlineData Object to KlineData Object
     * @param data
     * @return KlineObject
     */
    private String deserialize(String data) {

        return null;
    }
}
