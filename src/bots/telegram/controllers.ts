import { ChatType, Message, User } from "node-telegram-bot-api";
import { Telegram } from "./index";
import { Base, ISymbolAlerts, IRequiredMarketData, ISymbolDatabase, OrUndefined, ISingleSymbolData } from "../../types";
import { endsWithBase, validateSymbol, handleAlertAddition, validatePrice, removeAlertHandler, getAlertString, isAdmin, getUser, checkDevelopment } from "../../utils/telegram";
import { ALREADY_SUBSCRIBED, BTC_SUBSCRIPTION_LIST_BASE, ERROR_UNKNOWN, ERROR_UPDATING_SUBSCRIPTION, HELP_TEXT, INTRODUCTION, NOT_SUBSCRIBED_YET, NOT_VALID_SYMBOL, NO_ALERTS, NO_MATCHED_DOCUMENTS, NO_PERMISSION, NO_PRICE_PARAM, NO_SUBSCRIPTIONS, SHOW_HELP_TEXT, SPECIFY_SYMBOL, STOP_TEXT, SUBSCRIBE_SUCCESS, UNSUBSCRIBED, USDT_SUBSCRIPTION_LIST_BASE } from "./strings";
import { getBaseAbbrevation, getSymbolPrice } from "../../utils";
import { triggerThreshold } from "../../config";
import { getMarketData, getSymbolStats } from "../../utils/api";
import TelegramUser from "../../models/user";
import { ISingleSymbolDocument, UserDocumentResponse } from "../../types/models";
import usdtSymbolDB from "../../models/usdtDB";
import btcSymbolDB from "../../models/btcDB";
import mongoose from "mongoose";
import { UNKNOWN_ERROR } from "../discord/strings";

/* ROUTE INFO */
// - PUBLIC - Accessible by all users. Does not require user to be subscribed.
// - PROTECTED - Accessible by only subscribed users.
// - PRIVATE - Accessible only by me.


/**
 * - CONTROLLER FOR /help [PUBLIC]
 * 
 */

 export const help = (msg: Message) => {
    const id = msg.chat.id;
    const helpText = HELP_TEXT;
    Telegram.sendMessage(id, helpText);
 }


/**
 * 
 * - CONTROLLER TO SUBSCRIBE TO NOTIFICATIONS [PROTECTED]
 * - /start
 */

export const subscribe = async (msg: Message): Promise<void> => {
    const id: number = msg.chat.id;
    const chatType: ChatType = msg.chat.type;
    const username: OrUndefined<string> = msg.chat.username;
    const first_name: OrUndefined<string> = msg.chat.first_name;
    const last_name: OrUndefined<string> = msg.chat.last_name;

    if(checkDevelopment(msg)) return;

    const user: UserDocumentResponse = await getUser(id);
    
    // if user doesn't exist in the database,
    // Initialise user.
    if(!user) {
        let userObject = {
            userID: id,
            username: username ? username : "N/A",
            chatType: chatType,
            first_name: first_name,
            last_name:  last_name ? last_name : undefined,
            usdt_subs: [],
            btc_subs: [],
            usdt_alerts: {},
            btc_alerts: {}
        };

        // create user - mongoose Model.create()
        TelegramUser.create(userObject, function (err: any, userDoc: UserDocumentResponse) {
            if (err) {
                Telegram.sendMessage(id, ERROR_UNKNOWN);
                console.error(err);
                return;
            } 

            Telegram.sendMessage(id, SUBSCRIBE_SUCCESS);
            Telegram.sendMessage(id, SHOW_HELP_TEXT);
            Telegram.sendMessage(id, STOP_TEXT);
        });

        return;
    }

    Telegram.sendMessage(id, ALREADY_SUBSCRIBED);
}

/**
 * - CONTROLLER TO UNSUBSCRIBE TO ALERTS [PROTECTED]
 * - /stop
 */

export const unsubscribe = (msg: Message): void => {
    const id: number = msg.chat.id;
    // check if under maintenance?
    if(checkDevelopment(msg)) return;

    // Check if user is subscribed.
    TelegramUser.findOneAndDelete({userID: id}, undefined, function (err: any, deletedDoc: UserDocumentResponse) {
        // If any Misc error happens
        // Example: MongooseError
        if(err) {
            console.error(err);
            Telegram.sendMessage(id, ERROR_UNKNOWN);
            return;
        } 

        // If user doesn't exist
        if(!deletedDoc) {
            Telegram.sendMessage(id, NOT_SUBSCRIBED_YET);
            return;
        }
        // Send success message
        Telegram.sendMessage(id, UNSUBSCRIBED);

    });
 };



 /**
  * - CONTROLLER TO ADD SUBSCRIPTION [PROTECTED]
  * - /add [SYMBOL]
  */

export const addSubscription = async (msg: Message, match: RegExpExecArray | null): Promise<void> => {
    const id: number = msg.chat.id;
    // check if under maintenance?
    if(checkDevelopment(msg)) return;

    // Validate Symbol.
    const symbol: OrUndefined<string> = await validateSymbol(id, match);
    if (!symbol) {
        return;
    }
    const base: Base | boolean = endsWithBase(symbol);

    const user: UserDocumentResponse = await getUser(id);
    if(!user) {
        Telegram.sendMessage(id, NOT_SUBSCRIBED_YET);
        return;
    }

    
    if ((base === Base.USDT && user.get("usdt_subs", Array).includes(symbol)) ||
        base === Base.BTC && user.get("btc_subs", Array).includes(symbol)) {
        // Already subscribed to Symbol
        Telegram.sendMessage(id, `You are already subscribed to ${symbol}.`);
        return;
    }
    
    // Not yet subscribed, so add to the database.
    let update: Object;

    base == Base.USDT?
    update = {$push: {'usdt_subs': symbol}} :
    update = {$push: {'btc_subs': symbol}};

    TelegramUser.updateOne({userID: id}, update, undefined, function (err: any, response: any){
        if(err) {
            Telegram.sendMessage(id, ERROR_UNKNOWN);
            console.error(err);
            return;
        } 

        if(response.n == 0) {
            Telegram.sendMessage(id, NO_MATCHED_DOCUMENTS);
            return;
        }

        if(response.nModified == 0) {
            Telegram.sendMessage(id, ERROR_UPDATING_SUBSCRIPTION);
            return;
        }
        
        Telegram.sendMessage(id, `Added ${symbol} to your alerts. I will update you everytime it increases or decreases by ${triggerThreshold}%`);
    });

};


/**
 * - CONTROLLER TO REMOVE SUBSCRIPTION [PROTECTED]
 * - /remove [SYMBOL]
 */

 export const removeSubscription = async (msg: Message, match: RegExpExecArray | null): Promise<void> => {
    const id: number = msg.chat.id;
    // check if under maintenance?
    if(checkDevelopment(msg)) return;

    const symbol: OrUndefined<string> = await validateSymbol(id, match);
    if (!symbol) {
        return;
    }

    const base: Base | boolean = endsWithBase(symbol); // base is not false as it is already validated with `validateMatch()`

    const user: UserDocumentResponse = await getUser(id);
    if(!user) {
        Telegram.sendMessage(id, NOT_SUBSCRIBED_YET);
        return;
    }
    
    if ((base === Base.USDT && !user.get("usdt_subs", Array).includes(symbol)) ||
        base === Base.BTC && !user.get("btc_subs", Array).includes(symbol)) {
        // Already subscribed to Symbol
        Telegram.sendMessage(id, `You are not subscribed to ${symbol}.`);
        return;
    }

    let error_flag: boolean = false;
    let subs_array: Array<string>;

    if(base === Base.USDT) {
        //@ts-ignore
        subs_array = user.usdt_subs.filter((sym: string) => sym != symbol);
        user.set("usdt_subs", subs_array);

    } else {
        //@ts-ignore
        subs_array = user.btc_subs.filter((sym: string) => sym != symbol);
        user.set("btc_subs", subs_array);
    }
    
    await user.save();
    
    // Check for errors.
    if(error_flag) {
        Telegram.sendMessage(id, ERROR_UNKNOWN);
        return;
    }

    Telegram.sendMessage(id, `Unsubscribed from ${symbol}`);
 };


/**
 * 
 *  - CONTROLLER TO VIEW ALL SUBSCRIPTIONS [PROTECTED]
 *  - /viewall
 */

 export const viewSubscriptions = async (msg: Message): Promise<void> => {
    const id = msg.chat.id;
    // check if under maintenance?
    if(checkDevelopment(msg)) return;

    const user: UserDocumentResponse = await getUser(id);
    if(!user) {
        Telegram.sendMessage(id, NOT_SUBSCRIBED_YET);
        return;
    }

    /* USDT Subscriptions */
    const USDTSubscriptions: string[] = user.get("usdt_subs", Array);
    const usdt_string: string = USDTSubscriptions.join(", ");
    const usdt_string_final: string = USDT_SUBSCRIPTION_LIST_BASE.concat(usdt_string);

    

    /* BTC Subscriptions */
    const BTCSubscriptions: string[] = user.get("btc_subs", Array);
    const btc_string: string = BTCSubscriptions.join(", ");
    const btc_string_final = BTC_SUBSCRIPTION_LIST_BASE.concat(btc_string);

    if (USDTSubscriptions.length == 0 && BTCSubscriptions.length == 0) {
        Telegram.sendMessage(id, NO_SUBSCRIPTIONS);
        return;
    };
    if (USDTSubscriptions.length > 0) Telegram.sendMessage(id, usdt_string_final);
    if (BTCSubscriptions.length > 0) Telegram.sendMessage(id, btc_string_final);

 };


 /**
  * 
  * - CONTROLLER TO QUOTE ALL SUBSCRIPTIONS [PROTECTED]
  * - /quoteall
  */

export const quoteAllSubscriptions = async (msg: Message): Promise<void> => {
    const id = msg.chat.id;
    // check if under maintenance?
    if(checkDevelopment(msg)) return;

    const user: UserDocumentResponse = await getUser(id);
    if(!user) {
        Telegram.sendMessage(id, NOT_SUBSCRIBED_YET);
        return;
    }

    /* USDT Subscriptions */
    const USDTSubscriptions: string[] = user.get("usdt_subs", Array);
    let usdt_string: string = "USDT PRICE QUOTES:\n\n";
    let  usdtDocuments: mongoose.Document<ISingleSymbolDocument>[] = await usdtSymbolDB.find({symbol: {$in: USDTSubscriptions}}).exec();

    /* BTC Subscriptions */
    const BTCSubscriptions: string[] = user.get("btc_subs", Array);
    let btc_string: string = "BTC PRICE QUOTES:\n\n";
    let  btcDocuments: mongoose.Document<ISingleSymbolDocument>[] = await btcSymbolDB.find({symbol: {$in: BTCSubscriptions}}).exec();

    usdtDocuments.forEach((sub: mongoose.Document<ISingleSymbolDocument>) => {
       let quote = `${sub.get('symbol')}: ${sub.get('last_price')}\n`;
        usdt_string = usdt_string.concat(quote);
    });
    
    btcDocuments.forEach((sub: mongoose.Document<ISingleSymbolDocument>) => {
        let quote = `${sub.get('symbol')}: ${sub.get('last_price')}\n`;
        btc_string = btc_string.concat(quote);
    });

    if((USDTSubscriptions.length == 0 && BTCSubscriptions.length == 0)) {
        Telegram.sendMessage(id, NO_SUBSCRIPTIONS);
        return;
    }
    USDTSubscriptions.length > 0 ? Telegram.sendMessage(id, usdt_string): null;
    BTCSubscriptions.length > 0 ? Telegram.sendMessage(id, btc_string): null;
};

/**
 * 
 * - CONTROLLER TO SET A PRICE ALERT [PROTECTED]
 * - /setalert [SYMBOL] [PRICE]
 * 
 */
export const setAlert = async (msg: Message, match: RegExpExecArray | null): Promise<void> => {
    const id: number = msg.chat.id; 
    // check if under maintenance?
    if(checkDevelopment(msg)) return;

    const symbol: OrUndefined<string> = await validateSymbol(id, match);
    if (!symbol) return;
    const base: Base | boolean = endsWithBase(symbol); // base is not false as it is already validated with `validateSymbol()`. use base as Base!
    
    // Check if match has the PRICE parameter
    const price = validatePrice(id, match);
    if(!price) {
        Telegram.sendMessage(id, NO_PRICE_PARAM);
        return;
    }
    
    // handle alert addition
    handleAlertAddition(id, symbol, price, base as Base);
    
};


/**
 * - CONTROLLER TO REMOVE A PRICE ALERT. [PROTECTED]
 * - /removealert [SYMBOL] [PRICE]
 */

 export const removeAlert = async (msg: Message, match: RegExpExecArray | null): Promise<void> => {
     const id: number = msg.chat.id;
     // check if under maintenance?
    if(checkDevelopment(msg)) return;

    const symbol: OrUndefined<string> = await validateSymbol(id, match);
    if (!symbol) {
        return;
    }
    const base: Base | boolean = endsWithBase(symbol); // base is not false as it is already validated with `validateSymbol()`. use base as Base!
    const price: number | void = validatePrice(id, match);
    if(!price) {
        Telegram.sendMessage(id, NO_PRICE_PARAM);
        return;
    }

    // remove alert handler
    removeAlertHandler(id, symbol, base as Base, price);

 };


 /**
  * - CONTROLLER TO VIEW ALL ALERTS [PROTECTED]
  * - /viewalerts
  */

export const viewAlerts = async (msg: Message): Promise<void> => {
    const id: number = msg.chat.id;
    // check if under maintenance?
    if(checkDevelopment(msg)) return;
    
    const user = await getUser(id);
    if(!user) {
        Telegram.sendMessage(id, NOT_SUBSCRIBED_YET);
        return;
    }

    let USDTAlerts: ISymbolAlerts = user.get("usdt_alerts");
    let BTCAlerts: ISymbolAlerts = user.get("btc_alerts");
    
    let usdt_alerts_string: string | void = getAlertString(USDTAlerts, Base.USDT);
    let btc_alerts_string: string | void = getAlertString(BTCAlerts, Base.BTC);

    if (!usdt_alerts_string && !btc_alerts_string) {
        Telegram.sendMessage(id, NO_ALERTS);
        return;
    }
    if (usdt_alerts_string) Telegram.sendMessage(id, usdt_alerts_string);
    if (btc_alerts_string) Telegram.sendMessage(id, btc_alerts_string);
};  

/**
 * - CONTROLLER TO QUOTE THE PRICE FOR SYMBOL  [PUBLIC]
 * - /quote [SYMBOL]
 */
export const quotePrice = async (msg: Message, match: RegExpExecArray | null) => {
    const id: number = msg.chat.id;
    // check if under maintenance?
    if(checkDevelopment(msg)) return;

    const symbol: OrUndefined<string> = await validateSymbol(id, match);
    if (!symbol) {
        return;
    }
    
    const base = endsWithBase(symbol);
    const abbrv: string = getBaseAbbrevation(base as Base);

    // Get the price quote
    const price: number | null = await getSymbolPrice(symbol, base as Base);
    if (price) {
        Telegram.sendMessage(id, `${symbol} - ${price} ${abbrv}`);
    } else {
        Telegram.sendMessage(id, UNKNOWN_ERROR);
    }
}


/**
 * - CONTROLLER TO GET SYMBOL STATISTICS [PUBLIC]
 * - /stats [SYMBOL]
 */

export const getStats = async (msg: Message, match: RegExpExecArray | null): Promise<void> => {
    const id: number = msg.chat.id;
    // check if under maintenance?
    if(checkDevelopment(msg)) return;

    const symbol: OrUndefined<string> = await validateSymbol(id, match);
    if (!symbol) return;
    
    // make API call to get stats for symbol.
    let stats = await getSymbolStats(symbol);
    
    let message = `*${symbol} STATS*\n\nCurrent Price:  ${stats.lastPrice}\n24H high:  ${stats.highPrice}\n24H Low:  ${stats.lowPrice}\n24H change:  ${stats.priceChangePercent}%\n24H Volume:  ${stats.volume}\nWeighted Avg. Price:  ${stats.weightedAvgPrice}`;
    Telegram.sendMessage(id, message);   
};


/**
 * - CONTROLLER FOR /info
 */

 export const getInfo = async (msg: Message): Promise<void> => {
    const id: number = msg.chat.id;
    // check if under maintenance?
    if(checkDevelopment(msg)) return;


    const num_BTC: number = await btcSymbolDB.countDocuments().exec();
    const num_USDT: number = await usdtSymbolDB.countDocuments().exec();

    let message = `CryptoBOT currently tracks a total of ${num_BTC + num_USDT} symbols. Out of which ${num_USDT} are USDT base and ${num_BTC} are BTC base.\n\n${new Date()}`;
    Telegram.sendMessage(id, message);
 };


 /**
  * - CONTROLLER FOR /users
  */

export const getUserCount = async (msg: Message): Promise<void> => {
    const chatID: number = msg.chat.id;

    const id: number | undefined = msg.from?.id;
    if(!id) return;
    // if not admin, return;
    if(!isAdmin(id)) {
        Telegram.sendMessage(chatID, NO_PERMISSION);
        return;
    }
    // else send USER count.
    const userCount = await TelegramUser.countDocuments().exec();
    Telegram.sendMessage(chatID, `There are ${userCount} user(s) currently using #CryptoBOT`);
};


/**
 * - CONTROLLER FOR GREETING ROUTE
 * 
 */

export const greetNewUser = (msg: Message): void => {
    let chatID: number = msg.chat.id;
    let chatType: ChatType = msg.chat.type;


    //return if not a group
    const validTypes: string[] = ["group", "supergroup"];
    if(!validTypes.includes(chatType)) return;

    let newUsers: User[] | undefined = msg.new_chat_members;
    let leftUser: User | undefined = msg.left_chat_member;

    if(leftUser !== undefined) {
        Telegram.sendMessage(chatID, `Bubye, ${leftUser.first_name}`);
    }

    if (newUsers !== undefined) {
        newUsers.forEach((user: User) => {
            if(user.username === "alerts_cryptobot") {
                Telegram.sendMessage(chatID, INTRODUCTION);
                return;
            }

            let welcomeString: string = `Welcome, ${user.first_name}!`;
            Telegram.sendMessage(chatID, welcomeString);
        })
    } else {
        return;
    }
};


/**
 * CONTROLLER FOR /marketdata
 * 
 */

 export const getMarketDataController = async (msg: Message): Promise<void> => {
    const id: number = msg.chat.id;
    // check if under maintenance?
    if(checkDevelopment(msg)) return;

    const data: IRequiredMarketData | void = await getMarketData();
    if(! data){
        Telegram.sendMessage(id, `NO data`);
        return;
    }
    let message: string = `**Crypto Market Data**\n\n`;
        message += `Active Crypto:  ${data.active_cryptocurrencies}\n`;
        message += `Total Crypto:  ${data.total_cryptocurrencies}\n`;
        message += `Active Market Pairs:  ${data.active_market_pairs}\n`;
        message += `Total exchanges:  ${data.total_exchanges}\n`;
        message += `Active exchanges:  ${data.active_exchanges}\n`;
        message += `ETH Dominance:  ${data.eth_dominance}\n`;
        message += `BTC Dominance:  ${data.btc_dominance}\n`;
        message += `DeFi 24h Vol:  ${data.defi_volume_24h}\n`;
        message += `DeFi 24h change:  ${data.defi_24h_percentage_change}%\n`;
        message += `DeFi MarketCap:  ${data.defi_market_cap}\n`;
        message += `Stablecoin volume:  ${data.stablecoin_volume_24h}\n`;
        message += `Stablecoin Marketcap:  ${data.stablecoin_market_cap}\n`;
        message += `Derivates 24h vol:  ${data.defi_volume_24h}\n`;
        message += `Derivatives 24h change:  ${data.derivatives_24h_percentage_change}%\n`;
        
        Telegram.sendMessage(id, message);
 }



/**
 * - SPECIFY SYMBOL ERROR
 * 
 */

export const specifySymbol = (msg: Message) => {Telegram.sendMessage(msg.chat.id, SPECIFY_SYMBOL)}

/**
 * - POLLING ERROR HANDLER
 */

 export const errorHandler = (err: Error): void => {
    console.log(err.message);
 }