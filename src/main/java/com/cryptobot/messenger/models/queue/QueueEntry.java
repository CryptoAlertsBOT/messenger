package com.cryptobot.messenger.models.queue;

import com.cryptobot.messenger.models.kline.KlineData;
import lombok.Data;
import org.springframework.stereotype.Component;

@Component
@Data
public class QueueEntry {
    private String symbol;
    private String interval;
    private String window;
    private double threshold;
    private double burst;
    private String signal;
    private KlineData klineData;

}
