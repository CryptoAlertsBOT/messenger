package com.cryptobot.messenger.queue;

import com.cryptobot.messenger.pipeline.Pipeline;
import com.cryptobot.messenger.pipeline.stage.NotificationStage;
import com.cryptobot.messenger.platform.PlatformEnum;
import com.cryptobot.messenger.queue.model.Message;
import com.cryptobot.messenger.webhook.WebhookNotifier;
import com.cryptobot.messenger.webhook.models.WebHookEndpoint;
import com.cryptobot.messenger.webhook.service.WebhookEndpointService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mongodb.DuplicateKeyException;
import com.mongodb.MongoWriteException;
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
import java.util.*;
import java.util.concurrent.TimeoutException;

@Component
public class NotificationConsumer {
    private final ConnectionFactory factory;
    private final ObjectMapper mapper;
    private static final Logger logger = LoggerFactory.getLogger(NotificationConsumer.class);

    @Value("${spring.rabbitmq.host}")
    private String HOST;

    @Value("${spring.rabbitmq.port}")
    private int PORT;
    @Value("${queue.name}")
    private String QUEUE_NAME;


    private Pipeline notificationPipeline;
    private WebhookNotifier webhookNotifier;


    @Autowired
    public NotificationConsumer(ConnectionFactory factory, ObjectMapper mapper, Pipeline pipeline, WebhookNotifier webhookNotifier) {
        this.factory = factory;
        this.mapper = mapper;
        this.notificationPipeline = pipeline;
        this.webhookNotifier = webhookNotifier;
    }

    /**
     * Consumes messages from RabbitMQ
     * @throws IOException
     * @throws TimeoutException
     */
    public void consume() throws IOException, TimeoutException {
        try {
            // webhookNotifier.addEndpoint("https://discord.com/api/webhooks/1078108429668860014/kGoFElkjEsbMKTRUZ-KeI6ZNO4uI1uB1F-di5FfmdEtYJDv9lR6vlsb1-z-bHQ-pFIWJ");
            webhookNotifier.addEndpoint("https://discord.com/api/webhooks/1095465401103695872/mUEWg2KDJ0Ur-j2unmZZymKP42g6h40JVf-lqTJheya-3T-JAohdNN2E2A97nazICxIJ");
        } catch( Exception e) {
            //ignore
        }

//        System.out.println("Added endpoint");
        factory.setHost(HOST);
        factory.setPort(Integer.valueOf(PORT));
        Connection conn = factory.newConnection();
        Channel channel = conn.createChannel();

        Map<String, Object> arguments = new HashMap<>();
        arguments.put("x-message-ttl", 172800000); // 2 days

        channel.queueDeclare(QUEUE_NAME, true, false, false, arguments);

        // Queue will buffer output to this callback
        DeliverCallback callback = (consumerTag, delivery) -> {
            String message = new String(delivery.getBody(), "UTF-8");

            Message msg = this.deserialize(message);
            List<String> platforms = (ArrayList<String>) delivery.getProperties().getHeaders().get("platforms");


            List<String> fake = new ArrayList<>();
            fake.add("webhook");

            // Set Platform based on headers.
            msg.setPlatforms(this.getMessagePlatforms(fake));

            // Set the stages in pipeline
            notificationPipeline.init(msg);
            notificationPipeline.process();


            logger.info("Recieved entry item from {}: {}", QUEUE_NAME, msg);
        };

        // consume queue
        /**
         * Change basicAck = false later
         */
        channel.basicConsume(QUEUE_NAME, true, callback, consumerTag -> {});
    }


    /**
     * DeSerialize KlineData Object to KlineData Object
     * @param message
     * @return QueueEntry
     */
    private Message deserialize(String message) {
        Message entryItem = null;
        try {
            mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
            entryItem = mapper.readValue(message, Message.class);
        }
        catch (JsonProcessingException e) {
            logger.error("Error de-serializing Message object: {}", e.getMessage());
        }
        finally {
            return entryItem; 
        }
    }


    private List<PlatformEnum> getMessagePlatforms(List<String> platforms) {
        List<PlatformEnum> platformEnums = new ArrayList<>();

        // do some processing on the headers -> get the platform
        for (String platform: platforms ) {
            switch (platform) {
                case "all":
                    platformEnums.add(PlatformEnum.ALL);
                    break;
                case "twitter":
                    platformEnums.add((PlatformEnum.TWITTER));
                    break;
                case "discord":
                    platformEnums.add(PlatformEnum.DISCORD);
                    break;
                case "telegram":
                    platformEnums.add(PlatformEnum.TELEGRAM);
                    break;
                case "webhook":
                    platformEnums.add(PlatformEnum.WEBHOOK);
                    break;
            }
        }

        return platformEnums;
    }
}
