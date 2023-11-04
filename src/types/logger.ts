import { INotificationData } from "./notification";

export interface ILogTrigger extends INotificationData{}

export interface IErrorLog {
    message: string,
    fileName: string,
}