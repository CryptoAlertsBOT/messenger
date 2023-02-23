package com.cryptobot.messenger.webhook.service;

import com.cryptobot.messenger.webhook.dao.WebhookEndpointRepo;
import com.cryptobot.messenger.webhook.models.WebHookEndpoint;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WebhookEndpointService {

    private WebhookEndpointRepo webhookEndpointRepo;

    @Autowired
    public WebhookEndpointService(WebhookEndpointRepo webhookEndpointRepo) {
        this.webhookEndpointRepo = webhookEndpointRepo;
    }

    public void createEndpoint(String url) {
        WebHookEndpoint newEndpoint = new WebHookEndpoint(url);
        this.webhookEndpointRepo.save(newEndpoint);
    }

    /**
     * Gets all the webhook endpoints from database
     * @return
     */
    public List<WebHookEndpoint> getEndpoints() {
        return webhookEndpointRepo.getAllEndpoints();
    }

}
