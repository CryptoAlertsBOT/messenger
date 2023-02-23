package com.cryptobot.messenger.webhook.dao;

import com.cryptobot.messenger.webhook.models.WebHookEndpoint;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WebhookEndpointRepo extends MongoRepository<WebHookEndpoint, String> {

    @Query("{}")
    public List<WebHookEndpoint> getAllEndpoints();

}
