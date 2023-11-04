
import TelegramBot from "node-telegram-bot-api";
import { addSubscription, errorHandler, getInfo, getMarketDataController, getStats, getUserCount, greetNewUser, help, quoteAllSubscriptions, quotePrice, removeAlert, removeSubscription, setAlert, specifySymbol, subscribe, unsubscribe, viewAlerts, viewSubscriptions } from "./controllers";


/**
 * Documentation - https://github.com/yagop/node-telegram-bot-api
 */
if(!process.env.TELEGRAM_TOKEN) {
    process.exit(100);
}   

export const Telegram: TelegramBot = new TelegramBot(process.env.TELEGRAM_TOKEN!, {polling: true});

/*HELP TEXT */
Telegram.onText(/\/help/, help);

/* SUBSCRIBE */
Telegram.onText(/\/(start|START)/, subscribe);

/* UNSUBSCRIBE */
Telegram.onText(/\/(stop|STOP)/, unsubscribe);

/* ADD SUBSCRIPTION */
Telegram.onText(/\/(add|ADD) (.+)/, addSubscription);
Telegram.onText(/\/(add|ADD)$/, specifySymbol);

/* REMOVE SUBSCRIPTION */
Telegram.onText(/\/(remove|REMOVE) (.+)/, removeSubscription);
Telegram.onText(/\/(remove|REMOVE)$/, specifySymbol);

/* VIEW ALL SUBSCRIPTIONS */
Telegram.onText(/\/(viewall|VIEWALL)/, viewSubscriptions);

/* QUOTE ALL SUBSCRIPTIONS */
Telegram.onText(/\/(quoteall|QUOTEALL)/, quoteAllSubscriptions);

/* SET ALERT  */
Telegram.onText(/\/(setalert|SETALERT) (.+)$/, setAlert);
Telegram.onText(/\/(setalert|SETALERT)$/, specifySymbol);

/* REMOVE ALERT */
Telegram.onText(/\/(removealert|REMOVEALERT) (.+)$/, removeAlert);
Telegram.onText(/\/(removealert|REMOVEALERT)$/, specifySymbol);

/* VIEW ALERTS */
Telegram.onText(/\/(viewalerts|VIEWALERTS)/, viewAlerts);

/* QUOTE PRICE FOR SYMBOL */
Telegram.onText(/\/(quote|QUOTE) (.+)/, quotePrice);
Telegram.onText(/\/(quote|QUOTE)$/, specifySymbol);

/* GET STATS FOR SYMBOL */
Telegram.onText(/\/(stats|STATS) (.+)/, getStats);
Telegram.onText(/\/(stats|STATS)$/, specifySymbol);

/* GET INFO */
Telegram.onText(/\/(info|INFO)/, getInfo);

/* USER COUNT */
Telegram.onText(/\/(users|USERS)/, getUserCount);

/* MARKET DATA */
Telegram.onText(/\/(marketdata|MARKETDATA)/, getMarketDataController);

/* USER GREETINGS ON ENTER GROUP CHAT*/
Telegram.on("message", greetNewUser);


/* POLLING ERROR */
Telegram.on("polling_error", errorHandler);