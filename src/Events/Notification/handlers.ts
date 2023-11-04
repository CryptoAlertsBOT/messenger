import { Channel, MessageEmbed, User } from "discord.js";
import { Message } from "node-telegram-bot-api";
import Twitter from "twitter";
import NotificationEmitter from ".";
import { discord } from "../../bots/discord";
import { Telegram } from "../../bots/telegram";
import { twitter } from "../../bots/twitter";
import { Base } from "../../types";
import { embedColors, IChannelSubscriptions, IDiscordSymbolAlert, NotificationType } from "../../types/discord";
import { IErrorLog } from "../../types/logger";
import { INotificationData, INotificationDiscord, INotificationTelegram } from "../../types/notification";
import { formatTriggerTime, getBaseAbbrevation, getFormattedDateTime, getQuoteAsset, isMoreThan1Hour } from "../../utils";
import { createEmbed } from "../../utils/discord";
import { endsWithBase, isAdmin } from "../../utils/telegram";
import { SEND_NOTIF_TWITTER, CHECK_TELEGRAM_SUB, SEND_NOTIF_TELEGRAM, LOG_EXCEPTION, SEND_NOTIF_DISCORD, CHECK_NOTIF_DISCORD, SEND_CUSTOM_ALERT, SEND_NEW_ADDITION } from "../constants";
import { logger } from "../Logger/handlers";
import TelegramUser from "../../models/user";
import DiscordServer from "../../models/discordServer";
import { UserDocumentResponse, ServerDocumentResponse, ICustomPendingAlert, Platform, ICustomDiscordPendingAlert } from "../../types/models";
import axios from "axios";
import { INewAdditionData } from "../../types/webhook";

//Instanciate the NotificationEmitter class..
export const notification: NotificationEmitter = new NotificationEmitter();


/**
 * 
 * Event Handler - SEND_NOTIF_TWIITER [data]
 * - Takes the data provided to the emitter instance.
 * - Formats a string to post to Twitter.
 * - Uses the Twitter API library to post the formatted message.
 * 
 */

const env = process.env.NODE_ENV;

notification.on(SEND_NOTIF_TWITTER, (data: INotificationData): void => {
    /**
     * IF TRIGGER TIME > 1 HOURS : RETURN [REDUCE SPAM] 
     */

    if (isMoreThan1Hour(data.triggerTime)) return;

    const symbol: string = data.symbol;
    const price: number = data.last_price;
    const change: number = data.change;
    const triggerTimeString: string = formatTriggerTime(data.triggerTime);
    const quoteAsset: string | void = getQuoteAsset(symbol);
    
    if (!quoteAsset) {
        logger.logError("Invalid symbol passed to Notification event handler", "Notification/handlers.ts (SEND_NOTIF_TWITTER)");
        return;
    }


    // format the messsage string to be posted on twitter.
    const direction: string = Math.sign(change) === 1 ? `Increased` : `Decreased`;
    const base = endsWithBase(symbol);
    let signLessChange: number = Math.abs(change);

    let hashtags: string = `#${quoteAsset} #${symbol} #CryptoBOT`;

    if (base === Base.USDT && env !== "development") {
        let post: string;
        if(change > 0) {
            post = `$${quoteAsset}\n✅  ${direction} ${signLessChange.toFixed(2)}% in ${triggerTimeString}\n💵 Price - ${price} ${getBaseAbbrevation(base as Base)}\n⏱️ ${getFormattedDateTime()}\n${hashtags}`;
        } else {
            post = `$${quoteAsset}\n🔻 ${direction} ${signLessChange.toFixed(2)}% in ${triggerTimeString}\n💵 Price - ${price} ${getBaseAbbrevation(base as Base)}\n⏱️ ${getFormattedDateTime()}\n${hashtags}`;
        }

        
        // post tweet
        twitter.post('statuses/update', {status: post})
        .then ((tweet: Twitter.ResponseData) => {
            // success action event?
            
        })
        .catch((err) => {
            const errorData: IErrorLog = {message: err.message, fileName: "Notification/handler.ts [SEND_NOTIF_TWITTER] (catch block)"};
            logger.emit(LOG_EXCEPTION, errorData);
        })

    }
});


/**
 * 
 * Event Handler - CHECK_TELEGRAM_SUB [data]
 * - Has access to the users database.
 * - Checks for all the users who subscribed to the symbol.
 * - For every user, it emits an event `SEND_NOTIF_TELEGRAM` with the data required in the following event handler.
 * 
 */

 notification.on(CHECK_TELEGRAM_SUB, async (data: INotificationData): Promise<void> => {
    const symbol: string = data.symbol;
    const price: number = data.last_price;
    const change: number = data.change;
    const triggerTime: number = data.triggerTime;
    /**
     * If time > 6 hours: return
     */
    
    if(isMoreThan1Hour(triggerTime)) return
    console.log("Received payload: ", data);

    // Check the base of the SYMBOL.
    const base = endsWithBase(symbol);
    let query = {};
    if (base === Base.USDT) {
        query = { usdt_subs: { $in: [symbol] } }; // Users who have `symbol` in their `usdt_subs` array
    } else if (base === Base.BTC) {
        query = { btc_subs: { $in: [symbol] } }; // Users who have `symbol` in their `btc_subs` array
    }


    // Check all users subscriptions for SYMBOL.      
    const users: UserDocumentResponse[] = await TelegramUser.find(query).exec();

    users.forEach((user: UserDocumentResponse) => {
        if(!user) return;
        if (base === Base.USDT) {
            if(user.get("usdt_subs").includes(symbol)) {
                // send a notification to that user. [SEND_NOTIF_TELEGRAM]
                let data: INotificationTelegram = {
                    userID: user.get("userID"),
                    symbol,
                    last_price: price,
                    change,
                    triggerTime,
                } 
                console.log(data);
                notification.emit(SEND_NOTIF_TELEGRAM, data);
            }
        } else if (base === Base.BTC) {
            if (user.get("btc_subs").includes(symbol)) {
                // send a notification to that user. [SEND_NOTIF_TELEGRAM]
                let data: INotificationTelegram = {
                    userID: user.get("userID"),
                    symbol,
                    last_price: price,
                    change,
                    triggerTime,
                } 
                notification.emit(SEND_NOTIF_TELEGRAM, data);
            }
        }
    });
 });


/**
* Event Handler - SEND_NOTIF_TELEGRAM [data]
* - Module has access to the Telegram API library
* - Receives the data passed to the event handler (data)
* - Formats the message based on the data received from the emitter.
* - Sends a notification to the user with the user_id specified in the data object, with the formatted message.
*/


notification.on(SEND_NOTIF_TELEGRAM, (data: INotificationTelegram): void => {
    const userID: number = data.userID;
    const symbol: string = data.symbol;
    const price: number = data.last_price;
    const change: number = data.change;
    const triggerTime: number = data.triggerTime;
    const triggerTimeString: string = formatTriggerTime(triggerTime);
    const quoteAsset: string | void = getQuoteAsset(symbol);
    if (!quoteAsset) {
        logger.logError("Invalid symbol passed to Notification event handler", "Notification/handlers.ts (SEND_NOTIF_TELEGRAM)");
        return;
    }
    
    const direction: string = Math.sign(change) === 1 ? `Increased` : `Decreased`;
    const base = endsWithBase(symbol);
    let signLessChange: number = Math.abs(change);
    let message: string;

    if (change > 0) {
        message = `$${quoteAsset}\n✅ ${direction} ${signLessChange.toFixed(2)}% in ${triggerTimeString}\n💵 Price - ${price} ${getBaseAbbrevation(base as Base)}\n⏱️ ${getFormattedDateTime()}\n`;
    } else {
        message = `$${quoteAsset}\n🔻 ${direction} ${signLessChange.toFixed(2)}% in ${triggerTimeString}\n💵 Price - ${price} ${getBaseAbbrevation(base as Base)}\n⏱️ ${getFormattedDateTime()}`;
    }

    if (env !== "development") {
        Telegram.sendMessage(userID, message)
        .then((msg: Message) => {
            // Success handler
            
        })
    
        .catch((err) => {
            // Error handler
            const errorData: IErrorLog = {message: err.message, fileName: "Notification/handler.ts [SEND_NOTIF_TELEGRAM] (catch block 1)"};
            logger.emit(LOG_EXCEPTION, errorData);
        });
    } else if (env == "development" && isAdmin(userID)) {
        Telegram.sendMessage(userID, message)
        .then((msg: Message) => {
            // Success handler
            
        })
    
        .catch((err) => {
            // Error handler
            const errorData: IErrorLog = {message: err.message, fileName: "Notification/handler.ts [SEND_NOTIF_TELEGRAM] (catch block 2)"};
            logger.emit(LOG_EXCEPTION, errorData);
        });
    }
});


/**
 * Notification event handler to check if channel needs to be notified on Discord.
 * CHECK_NOTIF_DISCORD.
 * 
 */

 notification.on(CHECK_NOTIF_DISCORD, async (data: INotificationData) => {
    const symbol: string = data.symbol;
    
    // Check the base of the SYMBOL.
    const base = endsWithBase(symbol);

    // check the discord Db for subscriptions and find out if we have to send a notification event.
    // Read the database first
    const servers: ServerDocumentResponse[] =  await DiscordServer.find().exec();
    servers.forEach((server: ServerDocumentResponse) => {
        server!.get("symbol_subs") && Object.keys(server!.get("symbol_subs")).forEach(channelID => {

            let current_channel_subs: IChannelSubscriptions = server!.get("symbol_subs")[channelID];
            // base filters
            if (base == Base.USDT && current_channel_subs.usdt_subs.includes(symbol) ||
                base == Base.BTC && current_channel_subs.btc_subs.includes(symbol)) {
                // send out notification event.
                //
                // SEND_NOTIF DISCORD
                let notification_data: INotificationDiscord = {
                    ...data,
                    channelID
                }
                // Check if channelID is present in the server.channels array. 
                // If it is then don't send a SUBSCRIPTION alert.
                // Reason: The alert will already be sent to the channel via the GENERAl alert.

                if (!server!.get("channels").includes(channelID)) {
                    notification.emit(SEND_NOTIF_DISCORD, notification_data, NotificationType.SUBSCRIPTION);
                }
                
            }
        });
    });
 });




/**
 * Notification event handler for Sending notifications to discord servers.
 * SEND_NOTIF_DISCORD.
 */

notification.on(SEND_NOTIF_DISCORD, async (data: INotificationDiscord, type: NotificationType) => {
    // parse values from data.
    const symbol: string = data.symbol;
    const base = endsWithBase(symbol);

    const price: number = data.last_price;
    const change: number = data.change;
    const triggerTime: number = data.triggerTime;
    const triggerTimeString: string = formatTriggerTime(triggerTime);
    const quoteAsset: string | void = getQuoteAsset(symbol);

    if (!quoteAsset) {
        logger.logError("Invalid symbol passed to Notification event handler", "Notification/handlers.ts (SEND_NOTIF_DISCORD)");
        return;
    }


    const direction: string = Math.sign(change) === 1 ? `Increased` : `Decreased`;
    let signLessChange: number = Math.abs(change);

    let embedColor = '';
    change > 0 ? embedColor = embedColors.GAIN : embedColor = embedColors.LOSS;

    // Message alert to be sent.
    let message = `${direction} **${signLessChange.toFixed(2)}%** in **${triggerTimeString}**\nPrice - **${price}** ${getBaseAbbrevation(base as Base)}\n`;
    
    // Get the messaege Embed.
    const alert: MessageEmbed = createEmbed(symbol, message, embedColor, true, true);
    // get the database
    const servers: ServerDocumentResponse[] = await DiscordServer.find().exec();

    /**
     * 
     * GENERAL notifications.  [!start/!stop]
     * 
     */

    if(type == NotificationType.GENERAL) {

        /**
         * Return if time > 6 hours
         */

        if (isMoreThan1Hour(data.triggerTime)) return;

        // if Base == BTC base then return. 
        // in the future you can enable this to accept BTC base.
        if(base == Base.BTC) return;

        // send the alert to all the subscribed channels.
        
        servers.forEach((server: ServerDocumentResponse) => {
            server!.get("channels").forEach((channel: string) => {
                let currentChannel: Channel | undefined = discord.channels.cache.get(channel);
                //@ts-ignore
                currentChannel.send(alert);
            });
        })

        return;
    }

    if(env == "development") return;

    /**
     * 
     * SUBSCRIPTION notifiction
     * 
     */

    if(type == NotificationType.SUBSCRIPTION) {
        let currentChannel: Channel | undefined = discord.channels.cache.get(data.channelID);
        //@ts-ignore
        currentChannel.send(alert);
    }


});


/**
 * Send notification for custom alerts.
 * SEND_CUSTOM_ALERT
 */

notification.on(SEND_CUSTOM_ALERT, async (data: Readonly<ICustomDiscordPendingAlert>) => {
    if(data.platform === Platform.TELEGRAM) {
        // Telegram 
        Telegram.sendMessage(data.user_id, `${data.symbol} has reached your target price ${data.alert_price}`);
        return;
    }

    else if (data.platform === Platform.DISCORD) {
        // Discord

        // if channel ID exists, send a notification to the channel as well.
        if(data.channel_id) {
            let channelToSend: Channel | undefined = discord.channels.cache.find((channel: Channel) => channel.id === data.channel_id);
                 //@ts-ignore
                 if (channelToSend) channelToSend.send(`> **${data.symbol}** has reached your alert price - **${data.alert_price}**`);
        } 

        // Send a notification to the user.
        let userToSend: User = await discord.users.fetch(''+ data.user_id);
        //@ts-ignore
        userToSend.send(`> **${data.symbol}** has reached your alert price - **${data.alert_price}**`);
    }
});


/**
 * Send new symbola addition alerts
 * SEND_NEW_ADDITION
 */

notification.on(SEND_NEW_ADDITION, async (data: INewAdditionData) => {
    const asset: string | void = getQuoteAsset(data.symbol);
    if(!asset) return;
    let post: string = `Our systems are now tracking ${data.symbol}!\n\n$${asset}`
    
    // Send notification on Twitter
    // twitter.post('statuses/update', {status: post})
    // .then ((tweet: Twitter.ResponseData) => {
    //     // success action event?
        
    // })
    // .catch((err) => {
    //     const errorData: IErrorLog = {message: err.message, fileName: "Notification/handler.ts [SEND_NEW_ADDITION] (catch block)"};
    //     logger.emit(LOG_EXCEPTION, errorData);
    // })

    // Send notification on Telegram
    const telegramUsers: UserDocumentResponse[] = await TelegramUser.find().exec();

    telegramUsers.forEach((user: UserDocumentResponse) => {
        let userID = user!.get("userID");
        Telegram.sendMessage(userID, post)
        .then((msg: Message) => {
            // Success handler
            
        })
    
        .catch((err) => {
            // Error handler
            const errorData: IErrorLog = {message: err.message, fileName: "Notification/handler.ts [SEND_NOTIF_TELEGRAM] (catch block 1)"};
            logger.emit(LOG_EXCEPTION, errorData);
        });
    });
    // Send notification on Discord.GENERAL

    const servers: ServerDocumentResponse[] = await DiscordServer.find().exec();
    // send the alert to all the subscribed channels.
    
    let discordAlert: MessageEmbed = createEmbed("New Addition", post, embedColors.BLUE, true, true)
    servers.forEach((server: ServerDocumentResponse) => {
        server!.get("channels").forEach((channel: string) => {
            let currentChannel: Channel | undefined = discord.channels.cache.get(channel);
            //@ts-ignore
            currentChannel.send(discordAlert);
        });
    })
});

