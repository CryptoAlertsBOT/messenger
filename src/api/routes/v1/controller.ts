import express, { NextFunction, Response, Request } from "express";
import { notification } from "../../../Events/Notification/handlers";
import { CHECK_NOTIF_DISCORD, CHECK_TELEGRAM_SUB, SEND_CUSTOM_ALERT, SEND_NEW_ADDITION, SEND_NOTIF_DISCORD, SEND_NOTIF_TWITTER } from "../../../Events/constants";
import { NotificationType } from "../../../types/discord";
import { ICustomPendingAlert, IPendingAlert, Platform } from "../../../types/models";

/** 
 * GET /api/v1/alert 
 * 
 */

export const ping = (req: Request, res: Response, next: NextFunction): void => {
    res.send('OK')
    res.sendStatus(200);
    res.end();
}

/**
 * POST- api/v1/alert
 * @description Catches and processes the alert payloads from the main api-layer
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express Next Function
 */

export const alertHandler = (req: Request, res: Response, next: NextFunction): void => {
    // get the payload from the request
    const payload: IPendingAlert = req.body;
    console.log("Received payload: ", payload);

    // Fire off a notification event with the payload.
    // notification.emit(SEND_NOTIF_TWITTER, payload);
    notification.emit(CHECK_TELEGRAM_SUB, payload);
    // notification.emit(CHECK_NOTIF_DISCORD, payload, NotificationType.SUBSCRIPTION);
    // notification.emit(SEND_NOTIF_DISCORD, payload, NotificationType.GENERAL)

    //end the response.
    res.sendStatus(200);
    res.end();
}

/**
 * POST /api/v1/customalert
 * @description Catches and processes the custom alert payloads from the main api-layer
 * @param req Express Request Object
 * @param res Express Response Object
 * @param next Express Next Function
 */
export const customAlertHandler = (req: Request, res: Response, next: NextFunction) => {
    // get the payload from the request
    const payload: ICustomPendingAlert = req.body;
    
    // Fire off notification events with payload.
    notification.emit(SEND_CUSTOM_ALERT, payload);

    //end the response.
    res.sendStatus(200);
    res.end();
} 



export const newAdditionhandler = (req: Request, res: Response, next: NextFunction) => {
    // Get the symbol from the request body
    const data = req.body;   
    // Fire off the notification event with symbol.
    notification.emit(SEND_NEW_ADDITION, data);

    // End the response with status code.
    res.sendStatus(200);
    res.end();
};