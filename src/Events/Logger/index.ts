import {EventEmitter} from "events";
import colors from "colors";
import { getCurrentTimeString, getFormattedDateTime } from "../../utils";
import { ErrorLog } from "../../classes/Error";
import fs from "fs";

const DEBUG_LOG_FILE_PATH: string = "../../debug.log";

/**
 * @class Logger
 * @description Responsible for logging information to the console or the log file.
 * 
 */
class Logger extends EventEmitter {

    /**
     * @description Takes the trigge details and logs to the console.
     * @param symbol Symbol that hit the trigger.
     * @param price Current price of that symbol.
     * @param change Percentage change since last trigger.
     * 
     */
    public logTrigger(symbol: string, change: number, triggerTimeString: string): void {

        if(change > 0 ) {
            console.log(`${getFormattedDateTime().yellow} - ${symbol.bold} has hit the trigger condition in ${triggerTimeString.yellow}..${colors.green('[↑]')}`);
        } else {
            console.log(`${getFormattedDateTime().yellow} - ${symbol.bold} has hit the trigger condition in ${triggerTimeString.yellow}..${colors.red('[↓]')}`);
        }
    }   


    /**
     * 
     * @description Takes a message and a filename, constructs an Error Object and logs to the debug.log file.
     * @param message Error Message
     * @param fileName File name where the error occured
     * 
     */

    public logError(message: string, fileName: string): void {
        let error: ErrorLog = new ErrorLog(message, fileName);

        const timeOfError: Date = error.__time;     // Time of error
        const inFile: string = error.__fileName;    // Error occured in file
        const errorMessage: string = error.message; // Error Message
        const errorName: string = error.name;       // Error Name
        let stackTrace: string;                     // Error Stack Trace
        if(error.stack) stackTrace = error.stack;

        let log: string = `-----------------------------------------------\n`;
        log += `${errorName} - ${timeOfError}\n`;
        log += `In file ${inFile}\n`;
        log += `Reason: ${errorMessage}\n`
        log += `-----------------------------------------------\n\n`;
        
        fs.appendFile("debug.log", log, {encoding: "utf8", flag: "a"}, (err) => {
            if(err) console.error(`Error logging to debug.log\n ${err.message}`);
        });
    }
};


export default Logger;





