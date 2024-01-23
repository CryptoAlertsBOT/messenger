package com.cryptobot.messenger.models.kline;

import java.util.Date;

public class KlineData {

    public String id;

    private Date openTime;
    private double openPrice;
    private double highPrice;
    private double lowPrice;
    private double closePrice;
    private double volume;
    private Date closeTime;
    private double quoteAssetVolume;
    private int numberOfTrades;
    private double takerBuyBaseAssetVolume;

    private double takerBuyQuoteAssetVolume;
    private String unusedField;

    public KlineData() {}
    public KlineData(Date openTime, double openPrice, double highPrice, double lowPrice, double closePrice, double volume, Date closeTime, double quoteAssetVolume, int numberOfTrades, double takerBuyBaseAssetVolume, double takerBuyQuoteAssetVolume) {
        this.openTime = openTime;
        this.openPrice = openPrice;
        this.highPrice = highPrice;
        this.lowPrice = lowPrice;
        this.closePrice = closePrice;
        this.volume = volume;
        this.closeTime = closeTime;
        this.quoteAssetVolume = quoteAssetVolume;
        this.numberOfTrades = numberOfTrades;
        this.takerBuyBaseAssetVolume = takerBuyBaseAssetVolume;
        this.takerBuyQuoteAssetVolume = takerBuyQuoteAssetVolume;
    }



    public Date getOpenTime() {
        return openTime;
    }

    public double getOpenPrice() {
        return openPrice;
    }

    public double getHighPrice() {
        return highPrice;
    }

    public double getLowPrice() {
        return lowPrice;
    }

    public double getClosePrice() {
        return closePrice;
    }

    public double getVolume() {
        return volume;
    }

    public Date getCloseTime() {
        return closeTime;
    }

    public double getQuoteAssetVolume() {
        return quoteAssetVolume;
    }

    public int getNumberOfTrades() {
        return numberOfTrades;
    }

    public double getTakerBuyBaseAssetVolume() {
        return takerBuyBaseAssetVolume;
    }

    public double getTakerBuyQuoteAssetVolume() {
        return takerBuyQuoteAssetVolume;
    }

    public String getUnusedField() {
        return unusedField;
    }

    public void setOpenTime(Date openTime) {
        this.openTime = openTime;
    }

    public void setOpenPrice(double openPrice) {
        this.openPrice = openPrice;
    }

    public void setHighPrice(double highPrice) {
        this.highPrice = highPrice;
    }

    public void setLowPrice(double lowPrice) {
        this.lowPrice = lowPrice;
    }

    public void setClosePrice(double closePrice) {
        this.closePrice = closePrice;
    }

    public void setVolume(double volume) {
        this.volume = volume;
    }

    public void setCloseTime(Date closeTime) {
        this.closeTime = closeTime;
    }

    public void setQuoteAssetVolume(double quoteAssetVolume) {
        this.quoteAssetVolume = quoteAssetVolume;
    }

    public void setNumberOfTrades(int numberOfTrades) {
        this.numberOfTrades = numberOfTrades;
    }

    public void setTakerBuyBaseAssetVolume(double takerBuyBaseAssetVolume) {
        this.takerBuyBaseAssetVolume = takerBuyBaseAssetVolume;
    }

    public void setTakerBuyQuoteAssetVolume(double takerBuyQuoteAssetVolume) {
        this.takerBuyQuoteAssetVolume = takerBuyQuoteAssetVolume;
    }

    @Override
    public String toString() {
        return "KlineData{" +
                "openTime=" + openTime +
                ", openPrice=" + openPrice +
                ", highPrice=" + highPrice +
                ", lowPrice=" + lowPrice +
                ", closePrice=" + closePrice +
                ", volume=" + volume +
                ", closeTime=" + closeTime +
                ", quoteAssetVolume=" + quoteAssetVolume +
                ", numberOfTrades=" + numberOfTrades +
                ", takerBuyBaseAssetVolume=" + takerBuyBaseAssetVolume +
                ", takerBuyQuoteAssetVolume=" + takerBuyQuoteAssetVolume +
                ", unusedField='" + unusedField + '\'' +
                '}';
    }
}
