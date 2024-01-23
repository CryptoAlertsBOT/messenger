package com.cryptobot.messenger.mq;

import com.cryptobot.messenger.models.queue.QueueEntry;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;
import com.rabbitmq.client.DeliverCallback;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeoutException;

@Component
public class NotificationConsumer {
    private final ObjectMapper mapper;
    private static final Logger logger = LoggerFactory.getLogger(NotificationConsumer.class);

    @Value("${queue.host}")
    private String HOST;
    @Value("${queue.name}")
    private String QUEUE_NAME;

    @Autowired
    public NotificationConsumer(ObjectMapper mapper) {
        this.mapper = mapper;

    }

    /**
     * Consumes messages from RabbitMQ
     * @throws IOException
     * @throws TimeoutException
     */
    public void consume() throws IOException, TimeoutException {
        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost(HOST);
        Channel channel;
        Connection conn = factory.newConnection();
        channel = conn.createChannel();
        Map<String, Object> arguments = new HashMap<>();
        arguments.put("x-message-ttl", 86400000); // 2 days

        channel.queueDeclare(QUEUE_NAME, true, false, false, arguments);
        System.out.println("Waiting for messages. To exit press CTRL+C");

        // Queue will buffer output to this callback
        DeliverCallback callback = (consumerTag, delivery) -> {
            String message = new String(delivery.getBody(), StandardCharsets.UTF_8);
            QueueEntry entryItem = this.deserialize(message);
            logger.info("[x] Received entry item from {}: {}", QUEUE_NAME, entryItem);
        };

        // consume queue
        /**
         * Change basicAck = false later
         */
        channel.basicConsume(QUEUE_NAME, false, callback, consumerTag -> {});

    }


    /**
     * DeSerialize KlineData Object to KlineData Object
     * @param message
     * @return QueueEntry
     */
    private QueueEntry deserialize(String message) {
        QueueEntry entryItem = null;
        try {
            entryItem = mapper.readValue(message, QueueEntry.class);
        }
        catch (JsonProcessingException e) {
            logger.error("Error de-serializing QueueEntry object: {}", e.getMessage());
        }
        finally {
            return entryItem; 
        }
    }
}