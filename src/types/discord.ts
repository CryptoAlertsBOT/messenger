import Discord from "discord.js";
import { ISymbolAlerts } from ".";



export enum Commands {
    START = "start",
    STOP = "stop",
}


export interface IDiscordConfig {
    token: string
};


export enum ChannelType {
    Text = "text",
    Dm = "dm",
    Voice = "voice",
    Category= "category",
    News = "news",
    Store = "store",
    Unknown = "unknown"
};

export enum MessageType {
    Text = "text",
    Dm = "dm",
    News = "news"
};


export interface IDiscordCommand {
    name: string,
    description: string,
    usage: string,
    execute: (message: Discord.Message, args: string[]) => void
}

export interface IDiscordUser {
    id: string,
    name: string,
    btc_subs: Array<string>,
    usdt_subs: Array<string>,
    btc_alerts: ISymbolAlerts,
    usdt_alerts: ISymbolAlerts
}


export type IGuildChannels = Array<string>;

export interface IChannelSubscriptions {
    usdt_subs: string[],
    btc_subs: string[]
}

export interface ISymbolSubs {
    [channelID: string]: IChannelSubscriptions
}


export interface IDiscordSubscription {
    [channel: string]: IChannelSubscriptions
}

export interface IDiscordServer {
    id?: string,
    name?: string,
    channels: IGuildChannels,
    symbol_subs: IDiscordSubscription
}

export interface IDiscordSymbolAlerts {
    usdt_alerts?: {
        [symbol: string]: IDiscordSymbolAlert[]
    },
    btc_alerts?: {
        [symbol: string]: IDiscordSymbolAlert[]
    },
}

export interface IDiscordSymbolAlert {
    symbol: string,
    alert_price: number,
    price_when_set: number,
    userID: string,
    guildID: string,
    guildName: string,
    channelID?: string,
}




export enum embedColors {
    GAIN = "GREEN",
    LOSS = "RED",
    STATS = "BLUE",
    MAIN = "#731547",
    ORANGE = "ORANGE",
    BLUE = "BLUE"
}


export enum NotificationType {
    GENERAL = "GENERAL",
    SUBSCRIPTION = "SUBSCRIPTION",
    ALERT = "ALERT"
}
