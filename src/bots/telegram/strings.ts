export const NOT_VALID_SYMBOL: string = "Please enter a valid symbol.\nExample: \"BTCUSDT\" or \"LINKBTC\".\nOnly supports BTC or USDT base.";
export const ALREADY_SUBSCRIBED: string = "Already subscribed!";
export const UNSUBSCRIBED: string = "Unsubscribed.. Goodbye!";
export const SHOW_HELP_TEXT: string = `For list of all commands, send /help`;
export const STOP_TEXT: string = `To unsubscribe, send /stop`;
export const SUBSCRIBE_SUCCESS: string = `You have been subscribed to our alerts!`;
export const SUBSCRIBE_SUCCESS_MAINTAINANCE: string = `You have been subscribed to our alerts!\nPlease note that we are under MAINTAINANCE right now\nYour data may not persist.\nTry back again after sometime.\nSend /stop`;
export const BTC_SUBSCRIPTION_LIST_BASE: string = "*BTC Subscriptions* \n\n";
export const USDT_SUBSCRIPTION_LIST_BASE: string = "*USDT Subscriptions* \n\n";
export const ALERT_PRICE_NOT_SET: string = "Please set a price to alert you when hit.\nExample: To set an alert when BTCUSDT hits 20,000\n/setalert BTCUSDT 20000";
export const ALERT_ALREADY_SET: string = "You already have this alert set.\nTo remove this alert, use the command:\n/removealert [SYMBOL] [TRIGGER_PRICE]";
export const NOT_SUBSCRIBED_YET: string = "You're not subscribed yet.\nSend /start";
export const NO_PRICE_PARAM: string = "You did not pass a target price parameter.";
export const NO_SUBSCRIPTIONS: string = "You do not have any active subscriptions.\nTo add subscriptions, use command:\n/add [SYMBOL]";
export const HELP_TEXT: string = `Manage Subscriptions: \n\n/start - Subscribe to CryptoBOT Updates.\n/stop - Unsubscribe \n/add [SYMBOL] - Subscribe to a symbol alerts. (eg BTCUSDT)\n/remove [SYMBOL] - Unsubscribe symbol alerts.\n/setalert [SYMBOL] [ALERT_PRICE] - Set price alert for symbol\n/removealert [SYMBOL] [PRICE]- Remove specific 'PRICE' alert for 'SYMBOL'.\n/viewalerts - View all active price alerts.\n/viewall - View all subscriptions.\n/quoteall - Quote current prices of all subscriptions \n\nMarket Stats: \n\n/quote [SYMBOL] - Get current price of symbol.\n/marketdata - Get the current market statistics.\n/stats [SYMBOL] - Get symbol specific stats for the day.\n\nMISC: \n\n/info - Returns the number of currencies scanned by CryptoBOT atm.`
export const NO_PERMISSION: string = "You do not have permission to access this command.";
export const INTRODUCTION: string = "Hi, I am #CryptoBOT. I can add alerts / subscriptions for your favourite symbols and notify you when it hits your alert trigger or a default trigger value if subscribed. You can add personal alerts by texting me privately, or group alerts right here.\n\nLets begin? - /start";
export const SPECIFY_SYMBOL: string = "Please specify a valid symbol after the command.\nExamples of valid symbols:\nBTCUSDT (or) LINKBTC";
export const NO_ALERTS: string = "You have no alerts set.";
export const ERROR_UNKNOWN: string = "Something went wrong! please try again later.";
export const ERROR_UPDATING_SUBSCRIPTION: string = "Something went wrong!\nCouldn't add subscription to database.\nPlease try again later.";
export const NO_MATCHED_DOCUMENTS: string = "No documents have matched your query\nThis might be a database error.\nPlease try again later.";
export const MAINTENANCE_MODE: string = "Oops! We are under maintainance right now\nPlease come back and try again in a bit yeah?\nThank you,\nTeam #CryptoBOT.";



