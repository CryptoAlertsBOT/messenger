package com.cryptobot.messenger.pipeline;

import com.cryptobot.messenger.pipeline.stage.NotificationStage;
import com.cryptobot.messenger.platform.PlatformEnum;
import com.cryptobot.messenger.queue.model.Message;
import com.cryptobot.messenger.webhook.WebhookNotifier;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class Pipeline {

    private List<NotificationStage> stages;
    private Message message;

    private WebhookNotifier webhookNotifier;

    public Pipeline() {}
    @Autowired
    public Pipeline(WebhookNotifier webhookNotifier) {
        // init dependencies for all stages here

        this.webhookNotifier = webhookNotifier;
    }

    public void init(Message message) {
        this.message = message;
        this.stages = new ArrayList<>();

        for (PlatformEnum platform: message.getPlatforms()) {
            switch (platform) {
                case WEBHOOK:
                    this.stages.add(webhookNotifier);
                    break;
                case TWITTER:
                    break;
                case DISCORD:
                    break;
                case TELEGRAM:
                    break;

            }
        }
    }


    public void process() {
        // processes the pipeline's stages one by one
        System.out.println("Stages count: " + this.stages.size());
        for (NotificationStage stage: this.stages) {
            Message messageBody = this.message;

            try {
                stage.sendNotification(messageBody);
            } catch (Exception e) {
                throw new RuntimeException(e);
            }


        }
    }

    private void addStage(NotificationStage stage) {
        this.stages.add(stage);
    }

    @Override
    public String toString() {
        return "Pipeline{" +
                "stages=" + stages +
                ", message=" + message +
                '}';
    }
}
