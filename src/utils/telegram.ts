import { Base, ISingleAlert, ISymbolAlerts, ISymbolDatabase, OrUndefined } from "../types";
import { Telegram } from "../bots/telegram";
import { ALERT_ALREADY_SET, ERROR_UNKNOWN, MAINTENANCE_MODE, NOT_SUBSCRIBED_YET, NOT_VALID_SYMBOL } from "../bots/telegram/strings";
import TelegramUser from "../models/user";
import { ISingleSymbolDocument, UserDocumentResponse } from "../types/models";
import usdtSymbolDB from "../models/usdtDB";
import btcSymbolDB from "../models/btcDB";
import { Document } from "mongoose";
import TelegramBot from "node-telegram-bot-api";
import { telegramAdminUserID } from "../config";

/**
 * Block actions during Development mode.
 */

export const checkDevelopment = (msg: TelegramBot.Message): boolean => {
    if(process.env.NODE_ENV === 'development' && !isAdmin(msg.chat.id)) {
        Telegram.sendMessage(msg.chat.id, MAINTENANCE_MODE);
        return true;
    }
    return false;
}



/**
 * Check if SYMBOL is a valid symbol. [Ends with USDT or BTC]
 */

 export const endsWithBase = (symbol: string): Base | boolean => {
     if (symbol.endsWith("BTC")) {
         return Base.BTC;
     } else if (symbol.endsWith("USDT")) {
         return Base.USDT;
     } else {
         return false;
     }
 }


 /**
  * 
  * Check if symbol exists in the database.
  * 
  */

export const isSymbolInDB = async (symbol: string): Promise<boolean> => {
    let base: Base = symbol.endsWith("USDT") ? Base.USDT : Base.BTC;
    let DB = base === Base.USDT ? usdtSymbolDB : btcSymbolDB;
    // Check if database has symbol.
    let symbolData = await DB.findOne({symbol: symbol}).exec();
    return symbolData ? true : false;
};



/**
 * 
 * - Function to Validate the matched SYMBOL from the user command.
 * - Returns the SYMBOL if valid, or UNDEFINED otherwise.
 */
export const validateSymbol = async (id: number, match: RegExpExecArray | null): Promise<OrUndefined<string>>=> {
    if(!match) return;
    // query = match[1]
    match[1] = match[1].trim();
    const symbol = match[0].split(" ")[1].toUpperCase();
    const base: Base | boolean = endsWithBase(symbol);
    
    // Check if symbol ends with BTC or USDT
    if(base === false) {
        Telegram.sendMessage(id, NOT_VALID_SYMBOL);
        return;
    }
    
    // Check if symbol exists in either DB.
    let isInDB: boolean = await isSymbolInDB(symbol);
    if(!isInDB) {
        Telegram.sendMessage(id, NOT_VALID_SYMBOL);
        return;
    }
    return symbol;
}


/**
 * 
 * - Function to Validate the matched PRICE from the user command.
 * - Returns the PRICE if valid, or UNDEFINED otherwise.
 */
export const validatePrice = (id: number, match: RegExpExecArray | null): number | void=> {
    if (!match) return;
    if(match && !match[1]) {
        return;
    }
    
    const target_price: number = +match[2].split(' ')[1];
    return target_price;
}


/*
 * - Function to handle alert addition
 * - Adds the symbol to the corrosponding alerts list
 * @returns IUserDatabase | void
 */

 export const handleAlertAddition = async (telegramID: number, symbol: string, price: number, base: Base): Promise<void> => {
    const user: UserDocumentResponse = await getUser(telegramID);
    if(!user) {
        Telegram.sendMessage(telegramID, NOT_SUBSCRIBED_YET);
        return;
    }
    // Read the symbol database.
    let DB = base === Base.USDT? usdtSymbolDB : btcSymbolDB;
    let symbolDoc: Document<ISingleSymbolDocument> | null = await DB.findOne({symbol: symbol}).exec();
    let alerts_obj;
    alerts_obj = base === Base.USDT ? user.get("usdt_alerts"): user.get("btc_alerts");

    // init new alert
    let alert: ISingleAlert = {
        price_when_set: symbolDoc!.get('last_price'),
        alert_price: price,
    };
    // If symbol doesn't exists in DB
    // then init.
    if(!alerts_obj) {
        alerts_obj = {};
    }
    if(!alerts_obj.hasOwnProperty(symbol)) {
        alerts_obj[symbol] = [];
        alerts_obj[symbol].push(alert);

    } else if (alerts_obj.hasOwnProperty(symbol) && alerts_obj[symbol].some((price_alert: ISingleAlert) => price_alert.alert_price == price)) {
         // If symbol exists in DB and price too.
         // then send alert.
         Telegram.sendMessage(telegramID, ALERT_ALREADY_SET);
         return;
    } else {
         // If symbol exists in DB and price doesn't.
         // then send alert.
         
         alerts_obj[symbol].push(alert);
    }
    // set to path.
    if( base === Base.USDT) {
        user.set("usdt_alerts", alerts_obj);
        // mark the mixed property as modified.
        user.markModified("usdt_alerts");
    } else {
        user.set("btc_alerts", alerts_obj);
        // mark the mixed property as modified.
        user.markModified("btc_alerts");
    }
     
     
    // save the database.
     user.save((err) => {
        if(err) {
            Telegram.sendMessage(telegramID, ERROR_UNKNOWN);
            console.error(err);
            return;
        }
        Telegram.sendMessage(telegramID, `You will be alerted when ${symbol} hits ${price}`);
     });
 };     


 /**
  * - Function to remove an alert 
  * @returns IUserDatabase | void
  * 
  */

export const removeAlertHandler = async (telegramID: number, symbol: string, base: Base, price: number): Promise<void> => {
            
    //get user
    const user: UserDocumentResponse = await getUser(telegramID);
    if(!user) {
        Telegram.sendMessage(telegramID, NOT_SUBSCRIBED_YET);
        return;
    }
    
    let alert_obj;
    base === Base.USDT ?
    alert_obj = user.get("usdt_alerts"):
    alert_obj = user.get("btc_alerts");

    // if there is no SYMBOL in alerts
    if(!alert_obj.hasOwnProperty(symbol)) {
        Telegram.sendMessage(telegramID, `${symbol} doesn't have an alert set.`);
        return;
    }

    // If symbol exists but alert price doesn't exist
    else if (alert_obj.hasOwnProperty(symbol) && !alert_obj[symbol].some((price_alert: ISingleAlert) => price_alert.alert_price === price)) {
        Telegram.sendMessage(telegramID, `${symbol} doesn't have an alert at ${price}`);
        return;
    }

    // If Symbol and price alert both exists, then remove price alert.
    else if (alert_obj.hasOwnProperty(symbol) && alert_obj[symbol].some((price_alert: ISingleAlert) => price_alert.alert_price === price)) {
        let alertIndex: number = alert_obj[symbol].findIndex((alert: ISingleAlert) => alert.alert_price === price);
        // slice / remove alert.
        alert_obj[symbol].splice(alertIndex, 1);
    }

    // Check if symbol has alerts, if not remove symbol property
    if(alert_obj.hasOwnProperty(symbol) && Object.keys(alert_obj[symbol]).length === 0) {
        delete alert_obj[symbol];
    }

    if(base == Base.USDT) {
        user.set("usdt_alerts", alert_obj);
        user.markModified("usdt_alerts");
    } else {
        user.set("btc_alerts", alert_obj);
        user.markModified("btc_alerts");
    }

    user.save((err) => {
        if(err) {
            Telegram.sendMessage(telegramID, ERROR_UNKNOWN);
            console.error(err);
            return;
        }
        Telegram.sendMessage(telegramID, `Alert at ${price} removed for ${symbol}`);
    });
    
};


/**
 * Function to get Alert String
 * 
 */

export const getAlertString = (alerts: ISymbolAlerts, base: Base): string | void => {
    let alert_string: string;
    let hasAlerts: boolean = false;
    if (Object.keys(alerts).length > 0) hasAlerts = true;

    base === Base.USDT ? 
        alert_string = `*USDT ALERTS*\n\n` :
        alert_string = `*BTC ALERTS*\n\n`;
    
    
    for (const symbol of Object.keys(alerts)) {
        let symbol_alerts: ISingleAlert[] = alerts[symbol];
        alert_string += `${symbol}: `;
        symbol_alerts.forEach((alert: ISingleAlert) => {
            alert_string += `${alert.alert_price} ${base === Base.USDT ? "USDT" : "BTC"}, `;
        });
        alert_string += "\n";
    }
    
    if (hasAlerts) return alert_string;
};

/*
 * - Function to get number of symbols in database.
 */

export const getNumberOfSymbols = (database: ISymbolDatabase): number => {
    return Object.keys(database).length;
}   

/**
 * - Function to check if user is admin
 */

 export const isAdmin = (userID: number): boolean => {
    return userID === telegramAdminUserID;
 };


 /**
  * Function to get the user from database and validate.
  */

  export const getUser = async (telegramID: number): Promise<UserDocumentResponse | null> => {
        const user: UserDocumentResponse = await TelegramUser.findOne({userID: telegramID}).exec();
        if(!user) {
            return null;
        } else {
            return user;
        }
  };