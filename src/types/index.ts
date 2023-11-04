export interface IConfig {
    readonly [key: string]: string
}

export interface ISingleSymbolData {
    symbol: string,
    price: number,
}

export interface ISymbolDatabase {
    [symbol: string]: {
        last_price: number,
        change: number,
        last_triggered: Date,
    }
}

export interface ISymbolAlerts {
    [symbol: string]: ISingleAlert[]
}

export interface ISingleAlert {
    alert_price: number,
    price_when_set: number,
}

export type OrUndefined<T> = T | undefined;


export enum Base {
    USDT= "USDT",
    BTC ="BTC"
}

export interface ISymbolStats {
    symbol: string,
    priceChange: string,
    priceChangePercent: string,
    weightedAvgPrice: string,
    prevClosePrice: string,
    lastPrice: string,
    lastQty: string,
    bidPrice: string,
    askPrice: string,
    openPrice: string,
    highPrice: string,
    lowPrice: string,
    volume: string,
    quoteVolume: string,
    openTime: number,
    closeTime: number,
    firstId: number, // First tradeId
    lastId: number,  // Last tradeId
    count: number,   // Trade count
}


export type IRequiredSymbolStats = Partial<ISymbolStats>;



 /**
  * 
  */

  export interface IMarketData {
    active_cryptocurrencies: number,
    total_cryptocurrencies: number,
    active_market_pairs: number,
    active_exchanges: number,
    total_exchanges: number,
    eth_dominance: number,
    btc_dominance: number,
    defi_volume_24h: number,
    defi_volume_24h_reported: number,
    defi_market_cap: number,
    defi_24h_percentage_change: number,
    stablecoin_volume_24h: number,
    stablecoin_volume_24h_reported: number,
    stablecoin_market_cap: number,
    stablecoin_24h_percentage_change: number,
    derivatives_volume_24h: number,
    derivatives_volume_24h_reported: number,
    derivatives_24h_percentage_change: number,
    quote: Object,
    last_updated: Date,
  }

  export type IRequiredMarketData = Partial<IMarketData>;

  export enum Change {
      UP= "UP",
      DOWN= "DOWN"
  }