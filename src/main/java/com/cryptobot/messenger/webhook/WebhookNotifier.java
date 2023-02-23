package com.cryptobot.messenger.webhook;

import com.cryptobot.messenger.pipeline.stage.NotificationStage;
import com.cryptobot.messenger.platform.PlatformEnum;
import com.cryptobot.messenger.queue.model.Message;
import com.cryptobot.messenger.webhook.models.WebHookEndpoint;
import com.cryptobot.messenger.webhook.service.WebhookEndpointService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.net.http.HttpClient;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class WebhookNotifier extends NotificationStage {

    private WebhookEndpointService webhookEndpointService;
    private HttpClient httpClient = HttpClient.newBuilder().build();
    private RestTemplate restTemplate;

    @Autowired
    public WebhookNotifier(WebhookEndpointService webhookEndpointService, RestTemplate restTemplate) {
        this.setPlatform(PlatformEnum.WEBHOOK);
        this.webhookEndpointService = webhookEndpointService;
        this.restTemplate = restTemplate;
    }

    public void sendNotification(Message messageBody) throws Exception {
        // get all webhooks
        List<WebHookEndpoint> allEndpoints = this.webhookEndpointService.getEndpoints();
        int sCounter = 0;
        int fCounter = 0;
        for (WebHookEndpoint endpoint : allEndpoints) {
            Thread.sleep(2000);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);


            // Extract required fields
            String symbol = messageBody.getSymbol();
            String interval = messageBody.getInterval();
            String window = messageBody.getWindow();
            double threshold = messageBody.getThreshold();
            double burst = messageBody.getBurst();
            String signal = messageBody.getSignal();
            LocalDateTime closeTime = LocalDateTime.ofInstant(
                    messageBody.getKlineData().getCloseTime().toInstant(),
                    ZoneId.systemDefault()
            );
            String formattedCloseTime = closeTime.format(DateTimeFormatter.ofPattern("MMM dd, yyyy hh:mm:ss a"));

            // Build embed
            Map<String, Object> embed = new HashMap<>();
            embed.put("title", "Volume Alert!");
            embed.put("color", 6570404);
            embed.put("description", String.format("**Symbol:** %s\n**Interval:** %s\n**Window:** %s\n**Threshold:** %.2f\n**Burst:** %.2f\n**Side:** %s\n**Candle close:** %s", symbol, interval, window, threshold, burst, signal, formattedCloseTime));
            Map<String, Object> payload = new HashMap<>();
            payload.put("embeds", List.of(embed));

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(endpoint.getUrl(), request, String.class);

            if (response.getStatusCode() != HttpStatusCode.valueOf(204)) {
                System.out.println("Error sending webhook message!: " + messageBody);
                fCounter += 1;
            }  else {
                sCounter += 1;
            }

        }

        System.out.println(fCounter + " out of " + sCounter + " failed");
    }

    /**
     * Create an Endpoint
     * @param url
     */
    public void addEndpoint(String url) {
        this.webhookEndpointService.createEndpoint(url);
    }

    // Get all endpoints from the WebhookNotifier Service
    public List<WebHookEndpoint> getWebhookEndpoints() {
        return this.webhookEndpointService.getEndpoints();
    }

}
