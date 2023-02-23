package com.cryptobot.messenger.webhook.models;

import com.cryptobot.messenger.platform.PlatformEnum;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("webhook_endpoints")
public class WebHookEndpoint {
    @Id
    public String id;

    @Indexed(unique = true)
    private String url;

    private PlatformEnum platform;

    public WebHookEndpoint(String url) {
        this.platform = PlatformEnum.WEBHOOK;
        this.url = url;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUrl() {
        return url;
    }

    public PlatformEnum getPlatform() {
        return platform;
    }

    public void setPlatform(PlatformEnum platform) {
        this.platform = platform;
    }

    @Override
    public String toString() {
        return "WebHookEndpoint{" +
                "id='" + id + '\'' +
                ", url='" + this.getUrl() + '\'' +
                '}';
    }
}
