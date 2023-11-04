import { IPendingAlert } from "./models";

export type INotificationData = Readonly<IPendingAlert>

export interface INotificationTelegram extends INotificationData {
    readonly userID: number,
}

export interface INotificationDiscord extends INotificationData {
    readonly channelID: string,
}