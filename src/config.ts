import minimist, { ParsedArgs } from 'minimist';
import {IConfig} from "./types";
import mongoose from "mongoose";
import OS from 'os';

// Get the args passed to the node process
const args: ParsedArgs = minimist(process.argv.slice(2));

// App variables
export const triggerThreshold: number = args.t || 3.5;       // Trigger Threshold % to send updates when hit.
export const telegramAdminUserID: number = 844332395;       // Telegram Admin user ID to enable debug mode when using `main-dev` script.


// mongoose options
export const mongooseOptions: Object = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
};

//app api routes
const apiConfig: IConfig = {
    baseURL: "https://api.binance.com",
    marketPriceEndpoint: "/api/v3/ticker/price",
    symbolStats: "/api/v3/ticker/24hr",
    marketData: "https://pro-api.coinmarketcap.com/v1/global-metrics/quotes/latest",
}


// Discord configuration
export const prefix = "-"; // Command prefix
export const ownerOnly = false; // Only owner can stop / start
export const botPicURL = 'https://pbs.twimg.com/profile_images/1264951218649985024/jlP21Hob_400x400.jpg'; // Cryptobot pic url.
export const botURL = 'https://twitter.com/crypto3ot'; // Cryptobot LINK

// Set Threadpool size.
process.env.UV_THREADPOOL_SIZE = String(OS.cpus().length);

/**
 * Make the mongoose connection here.
 * 
 */
mongoose.connect('mongodb+srv://admin:admin@cluster0.pbpha.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', mongooseOptions)
    .then(() => {
        console.log("[SERVICE] Connection to database established...".green);
    })
    .catch(err => console.error(`Connection to database failed: \n\n ${err}`.red));
 

export default apiConfig;
