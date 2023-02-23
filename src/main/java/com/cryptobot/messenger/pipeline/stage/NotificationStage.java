package com.cryptobot.messenger.pipeline.stage;

import com.cryptobot.messenger.platform.PlatformEnum;
import com.cryptobot.messenger.queue.model.Message;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public abstract class NotificationStage {

    private PlatformEnum platform;

    public PlatformEnum getPlatform() {
        return platform;
    }

    public void setPlatform(PlatformEnum platform) {
        this.platform = platform;
    }

    // send message to platform
    public abstract void sendNotification(Message messageBody) throws Exception;
}
