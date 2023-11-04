import { prefix } from "../../../config";
import Discord from "discord.js";
import { endsWithBase } from "../../../utils/telegram";
import { getMessageGlobals, isValidArgs, validateSymbol } from "../../../utils/discord";
import { Base } from "../../../types";
import DiscordBTCAlert from "../../../models/btcAlert";
import DiscordUSDTAlert from "../../../models/usdtAlert";
import mongoose, { CallbackError } from "mongoose";
import { IDiscordSymbolAlert } from "../../../types/discord";
import { UNKNOWN_ERROR } from "../strings";

module.exports = {
    name: "removealert",
    description: "Remove alert at price for symbol. Use flag -a OR --all to remove all alerts",
    usage: `${prefix}removealert BTCUSDT 50000 [OR] ${prefix}removealert --all`,
    execute: async (msg: Discord.Message, args: string[], flags: string[]) => {
        //get msg globals
        const [guildID, guildName, guildChannelID] = getMessageGlobals(msg);
        if(!guildChannelID) return;
        // Get the message author id.
        const authorID: string = msg.author.id;
        // Check flags [--all, -a]
        const removeAll: boolean = flags.includes("all") || flags.includes("a");
        let query;

        if(!removeAll) {
            //Validate the provided arguments.
            if(!isValidArgs(args[0], args[1], msg)) return;

            const symbol: string = args[0].toUpperCase();
            const price: string = args[1];
            // Check if symbol is a valid symbol.
            const isValidSymbol: boolean = await validateSymbol(symbol, msg);
            if(!isValidSymbol) return;
            // Get the Symbol Base
            const base: Base | boolean = endsWithBase(symbol);
            if(!base) return;

            /**
             * Remove one symbol.
             */

            // First Check if the guild is present in the db
            query = {"symbol": symbol, "alert_price": price, "userID": authorID};
            let alertsDB: mongoose.Model<mongoose.Document<IDiscordSymbolAlert>> = base === Base.USDT ? DiscordUSDTAlert : DiscordBTCAlert;
            alertsDB.findOneAndDelete(query, undefined, (err: mongoose.CallbackError, doc: mongoose.Document<IDiscordSymbolAlert> | null, res: any) => {
                if(err) {
                    msg.channel.send(UNKNOWN_ERROR);
                    return;
                }
                doc ? 
                msg.channel.send(`>>> Removed alert for **${symbol}** at **${price}**.`) : 
                msg.channel.send(`>>> You don't have any alerts for **${symbol}** at **${price}**.`);
                return;
            });
        }

        /**
         * Remmove -all
         */
        if(removeAll) {
            query = {"userID": authorID};

            // Remove All USDT alerts 
            DiscordUSDTAlert.deleteMany(query, undefined, (err: CallbackError) => {
                if(err) {
                    msg.channel.send(UNKNOWN_ERROR);
                    return;
                }
            });

            // Remove all BTC alerts.
            DiscordBTCAlert.deleteMany(query, undefined, (err: CallbackError) => {
                if(err) {
                    msg.channel.send(UNKNOWN_ERROR);
                    return;
                }
            });

            msg.channel.send(`>>> Removed all alerts for you.`);
            return;
        }
    },
};