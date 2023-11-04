import Logger from ".";
import { IErrorLog, ILogTrigger } from "../../types/logger";
import { formatTriggerTime } from "../../utils";
import { LOG_EXCEPTION, LOG_TRIGGER } from "../constants";

/* Logger instance */
export const logger: Logger = new Logger();

/**
 * 
 * - LOG_TRIGGER Handler [data]
 * 
 */
logger.on(LOG_TRIGGER, (data: ILogTrigger): void => {
    const symbol: string = data.symbol;
    const change: number = data.change;
    const triggerTimeString: string = formatTriggerTime(data.triggerTime);
    
    // call the logTrigger() function to log.
    logger.logTrigger(symbol, change, triggerTimeString);
});


/**
 * - LOG_EXCEPTION [data]
 */

 logger.on(LOG_EXCEPTION, (data: IErrorLog): void => {
    const message: string = data.message;
    const fileName: string = data.fileName;

    // Call the logError() function.
    logger.logError(message, fileName);
 });

