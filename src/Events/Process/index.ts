import { DEFAULT_EXIT_ERROR, NO_API_KEYS } from "../../globals/constants";
import colors from "colors";
import fs from "fs";
import path from "path";

process.on("exit", (code) => {
    switch(code) {
        case 100:
            console.error(`${colors.yellow(code.toString())} - ${colors.bgRed(NO_API_KEYS)}`);
            break;
        default:
            console.error(`${colors.yellow(code.toString())} - ${colors.bgRed(DEFAULT_EXIT_ERROR)}`)
    }
});

process.on("uncaughtException", (err: Error, origin: string) => {
    const DEBUG_LOG_PATH: string = path.resolve(__dirname, "../../../debug.log");
    let log_text: string = `\n============\n${new Date()}`;
    log_text += err;
    log_text += '\n';
    log_text += `ORIGIN: ${origin}`;
    log_text += "\n================\n";

    fs.appendFile(DEBUG_LOG_PATH, log_text, {encoding: 'utf-8'}, (err: NodeJS.ErrnoException | null) => {
        if(err) console.error("Error wriritng to Debug.Log".red);
    });
});


process.on('unhandledRejection', (reason, promise: Promise<any>) => {
    let text: string = `\n============\n${new Date()}\nUnhandled Rejection at: ${promise}.\nReason: ${reason}\n================\n`;

    // Application specific logging, throwing an error, or other logic here
    const DEBUG_LOG_PATH: string = path.resolve(__dirname, "../../../debug.log");
    fs.appendFile(DEBUG_LOG_PATH, text, {encoding: 'utf-8'}, (err: NodeJS.ErrnoException | null) => {
        if(err) console.error("Error wriritng to Debug.Log".red);
    });
});