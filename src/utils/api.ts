/* UTILITY MODULE FOR API FUNCTIONALITY */
import axios, { AxiosResponse } from "axios";
import api from "../config";
import { logger } from "../Events/Logger/handlers";
import { IMarketData, IRequiredMarketData, IRequiredSymbolStats, ISymbolStats } from "../types";



/**
 * - API CALL FOR MARKET PRICE FOR SYMBOLS [MAIN]
 * - GET /api/v3/ticker/price
 */

export const getMarketPriceData = (): Promise<AxiosResponse> | null => {
    try {
        let response: Promise<AxiosResponse> = axios.get(`${api.baseURL}${api.marketPriceEndpoint}`);
        return response
    } catch (err) {
        console.error(`api.ts (getMarketPriceData)\n\n ${err}.red`);
        return null;
    }
};


/**
 * - API CALL FOR SYMBOL STATS [past 24h performance]
 * - GET /api/v3/ticker/24hr
 */

export const getSymbolStats = async (symbol: string): Promise<IRequiredSymbolStats> => {
    let response: AxiosResponse<ISymbolStats> = await axios.get(`${api.baseURL}${api.symbolStats}`, {params: {symbol}});
    const symbolStats: ISymbolStats = response.data;

        // Destructure symbol stats.
        const lastPrice: string = symbolStats.lastPrice;
        const highPrice: string = symbolStats.highPrice;
        const lowPrice: string = symbolStats.lowPrice;
        const priceChangePercent: string = symbolStats.priceChangePercent;
        const volume: string = symbolStats.volume;
        const weightedAvgPrice: string = symbolStats.weightedAvgPrice;

        // return an object with the required data.

        let stats: IRequiredSymbolStats = {
            symbol,
            lastPrice,
            highPrice,
            lowPrice,
            priceChangePercent,
            volume,
            weightedAvgPrice,
        };

        return stats;
};

/**
 * - API To get the /marketdata
 * - https://pro-api.coinmarketcap.com/v1/global-metrics/quotes/latest
 * - params - {convert - "USD"}
 * - headers - {"X-CMC_PRO_API_KEY": "d6db63aa-9881-4b4d-898e-bea37fd0ae6b",} 
 */


export const getMarketData = async (): Promise<IRequiredMarketData | void> => {
    

    let request : AxiosResponse = await axios.get(`${api.marketData}`, {
        params: {
            convert: "USD",
        },
    
        headers: {
            "X-CMC_PRO_API_KEY": "d6db63aa-9881-4b4d-898e-bea37fd0ae6b",
        }});

        const marketData: IMarketData = request.data.data;
        let requiredData: IRequiredMarketData = {
            active_cryptocurrencies: marketData.active_cryptocurrencies,
            total_cryptocurrencies: marketData.total_cryptocurrencies,
            active_market_pairs: marketData.active_market_pairs,
            active_exchanges: marketData.active_exchanges,
            total_exchanges: marketData.total_exchanges,
            eth_dominance: +marketData.eth_dominance.toFixed(2),
            btc_dominance: +marketData.btc_dominance.toFixed(2),
            defi_volume_24h: +marketData.defi_volume_24h.toFixed(2),
            defi_volume_24h_reported: +marketData.defi_volume_24h_reported.toFixed(2),
            defi_market_cap: +marketData.defi_market_cap.toFixed(2),
            defi_24h_percentage_change: +marketData.defi_24h_percentage_change.toFixed(2),
            stablecoin_volume_24h: +marketData.stablecoin_volume_24h.toFixed(2),
            stablecoin_volume_24h_reported: +marketData.stablecoin_volume_24h_reported.toFixed(2),
            stablecoin_market_cap: +marketData.stablecoin_market_cap.toFixed(2),
            stablecoin_24h_percentage_change: +marketData.stablecoin_volume_24h_reported.toFixed(2),
            derivatives_volume_24h: +marketData.derivatives_volume_24h.toFixed(2),
            derivatives_volume_24h_reported: +marketData.derivatives_volume_24h_reported.toFixed(2),
            derivatives_24h_percentage_change: +marketData.derivatives_24h_percentage_change.toFixed(2),
        }
        
        return requiredData;
        
        

};