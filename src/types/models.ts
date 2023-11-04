import mongoose from 'mongoose';
import { Base } from '.';
import { IGuildChannels, IDiscordSubscription, IDiscordSymbolAlerts } from './discord';

export interface IPendingAlert {
    symbol: string,
    last_price: number,
    change: number,
    triggerTime: number
}

export enum Platform {
    DISCORD="Discord",
    TELEGRAM="Telegram"
}

export interface ICustomPendingAlert {
    platform: Platform,
    symbol: String,
    user_id: number,
    alert_price: number,
}

export interface ICustomDiscordPendingAlert extends ICustomPendingAlert {
    channel_id?: string | undefined,
    alert_id?: mongoose.ObjectId,
    base: Base
}

// Telegram users //

export interface IUserSchema {
    userID: number,
    chatType: string,
    username?: string,
    first_name?: string,
    last_name?: string,
    usdt_subs: Array<string>,
    btc_subs: Array<string>,
    usdt_alerts: Object,
    btc_alerts: Object
}

export interface UserModel extends IUserSchema, mongoose.Document{};

export type UserDocumentResponse = mongoose.Document<IUserSchema> | null;

// Discord server //

export interface IServerSchema {
    serverID?: string,
    name?: string,
    channels: IGuildChannels[],
    symbol_subs: IDiscordSubscription,
    symbol_alerts: IDiscordSymbolAlerts
}

export interface IServerModel extends IServerSchema, mongoose.Document {};

export type ServerDocumentResponse = mongoose.Document<IServerSchema> | null;



// DB models //
export interface ISingleSymbolDocument extends mongoose.Document{
    symbol: string,
    last_price: number,
    change: number,
    last_triggered: Date,
}


