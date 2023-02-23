package com.cryptobot.messenger.queue.model;

import com.cryptobot.messenger.kline.models.KlineData;
import com.cryptobot.messenger.platform.PlatformEnum;
import org.springframework.stereotype.Component;

import java.util.List;


@Component
public class Message {
    private List<PlatformEnum> platforms;
    private String symbol;
    private String interval;
    private String window;
    private double threshold;
    private double burst;
    private String signal;
    private KlineData klineData;

    public Message() {}
    public Message(String symbol, String interval, String window, double threshold, double burst, String signal, KlineData klineData) {
        this.symbol = symbol;
        this.interval = interval;
        this.window = window;
        this.threshold = threshold;
        this.burst = burst;
        this.signal = signal;
        this.klineData = klineData;
    }

    public List<PlatformEnum> getPlatforms() {
        return platforms;
    }

    public void setPlatforms(List<PlatformEnum> platforms) {
        this.platforms = platforms;
    }

    public String getSignal() {
        return signal;
    }

    public void setSignal(String signal) {
        this.signal = signal;
    }

    public KlineData getKlineData() {
        return klineData;
    }

    public void setKlineData(KlineData klineData) {
        this.klineData = klineData;
    }

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public String getInterval() {
        return interval;
    }

    public void setInterval(String interval) {
        this.interval = interval;
    }

    public String getWindow() {
        return window;
    }

    public void setWindow(String window) {
        this.window = window;
    }

    public double getThreshold() {
        return threshold;
    }

    public void setThreshold(double threshold) {
        this.threshold = threshold;
    }

    public double getBurst() {
        return burst;
    }

    public void setBurst(double burst) {
        this.burst = burst;
    }

    @Override
    public String toString() {
        return "Message{" +
                "platform=" + platforms +
                ", symbol='" + symbol + '\'' +
                ", interval='" + interval + '\'' +
                ", window='" + window + '\'' +
                ", threshold=" + threshold +
                ", burst=" + burst +
                ", signal='" + signal + '\'' +
                ", klineData=" + klineData +
                '}';
    }
}
