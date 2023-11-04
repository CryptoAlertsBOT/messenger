import mongoose from "mongoose";
import { prefix } from "../../../config";
import Discord from "discord.js";
import { getMessageGlobals, isValidArgs, validateSymbol } from "../../../utils/discord";
import DiscordUSDTAlert from "../../../models/usdtAlert";
import DiscordBTCAlert from "../../../models/btcAlert";
import { Base } from "../../../types";
import { endsWithBase } from "../../../utils/telegram";
import { IDiscordSymbolAlert } from "../../../types/discord";
import { getSymbolPrice } from "../../../utils";
import { UNKNOWN_ERROR } from "../strings";

module.exports = {
    name: "setalert",
    description: "Set an alert at a certain price for any market pair. Be notified when triggered.",
    usage: `${prefix}setalert BTCUSDT 50000`,
    execute: async (msg: Discord.Message, args: string[], flags: string[]): Promise<void> => {
        //get msg globals
        const [guildID, guildName, guildChannelID] = getMessageGlobals(msg);
        if(!guildChannelID) return;
        // Get the message author id.
        const authorID: string = msg.author.id;
        //Validate the provided arguments.
        if(!isValidArgs(args[0], args[1], msg)) return;

        // Check for channel flag [c | channel]
        let isChannelAlert: boolean = flags.includes("c") || flags.includes("channel");

        const symbol: string = args[0].toUpperCase();
        const price = args[1];
        // Check if symbol is a valid symbol.
        const isValidSymbol: boolean = await validateSymbol(symbol, msg);
        if(!isValidSymbol) return;
        // Get the Symbol Base
        const base: Base | boolean = endsWithBase(symbol);
        if(!base) return;

        // get the current price.
        const currentPrice: number | null = await getSymbolPrice(symbol, base as Base);
        if(!currentPrice) return;
        // Check if current alert is already set.
        let query = {'symbol': symbol, 'alert_price': +price, 'userID': authorID};
        const alertDB: mongoose.Model<mongoose.Document<IDiscordSymbolAlert>> = base === Base.USDT ? DiscordUSDTAlert : DiscordBTCAlert;
        const exists = await alertDB.findOne(query);

        // Check if alert exists in the DB. If not instanciate and create a symbol alert.
        if(exists) {
            msg.channel.send(`>>> Price alert for **${symbol}** at **${price}** already exists.`);
            return;
        }
        
        // alert object 
        let alertObj: IDiscordSymbolAlert = {
            symbol: symbol,
            alert_price: +price,
            price_when_set: currentPrice,
            userID: authorID,
            guildID: guildID!,
            guildName: guildName!
        };

        // Check if alert is a channel alert.
        // If yes, then add a channelID prop to `alertObj`.
        if(isChannelAlert) alertObj.channelID = guildChannelID;

        let alert: mongoose.Document<IDiscordSymbolAlert> = new alertDB(alertObj);
        alert.save((err) => {
            if(err) {
                msg.channel.send(UNKNOWN_ERROR);
                return;
            }
            // Saved!
            isChannelAlert ?
            msg.channel.send(`>>> You will be alerted in this channel when **${symbol}** reaches **${price}**`): 
            msg.channel.send(`>>> You will be alerted via DM when **${symbol}** reaches **${price}**`);
        });

        return;
    }
}