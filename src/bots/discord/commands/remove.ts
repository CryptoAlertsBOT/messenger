import Discord from "discord.js";
import { prefix } from "../../../config";
import { Base } from "../../../types";
import { getMessageGlobals, validateSymbol } from "../../../utils/discord";
import { endsWithBase } from "../../../utils/telegram";
import { NOT_SUBSCRIBED, NOT_VALID_SYMBOL_DISCORD, UNKNOWN_ERROR } from "../strings";
import DiscordServer from "../../../models/discordServer";
import { ServerDocumentResponse } from "../../../types/models";

module.exports = {
    name: "remove",
    description: "Remvoes existing subscriptions.",
    usage: `${prefix}remove BTCUSDT`,
    execute: async (msg: Discord.Message, args: string[], flags: string[]): Promise<void> => {
        //get msg globals
        const [guildID, guildName, guildChannelID] = getMessageGlobals(msg);
        if(!guildChannelID) return;

        // parse the symbol from the command.
        if (args.length == 0) {
            msg.channel.send(NOT_VALID_SYMBOL_DISCORD);
            return;
        }
        const symbol: string = args[0].toUpperCase();
        // Check if symbol is a valid symbol.
        const isValidSymbol: boolean = await validateSymbol(symbol, msg);
        if(!isValidSymbol) return;
        // Get the Symbol Base
        const base: Base | boolean = endsWithBase(symbol);

        // check if server ID is in the Database. if not add it.
        let currentGuild: ServerDocumentResponse = await DiscordServer.findOne({serverID: guildID}).exec();
        if(!currentGuild) {
            msg.channel.send(NOT_SUBSCRIBED);
            return;
        }

        let symbol_subs = currentGuild.get("symbol_subs");
        //USDT
        let usdt_subscriptions = symbol_subs[guildChannelID].usdt_subs;
        //BTC
        let btc_subscriptions = symbol_subs[guildChannelID].btc_subs;
        // removed flag
        let removed = false;

        base == Base.USDT ?
        usdt_subscriptions.forEach((sym: string, index: number) => {
            if (sym == symbol) {
                usdt_subscriptions.splice(index, 1);
                removed = true;
            }
        })
        :
        btc_subscriptions.forEach((sym: string, index: number) => {
            if(sym == symbol) {
                btc_subscriptions.splice(index, 1);
                removed = true;
            }
        });
        
        //save DB
        if(removed) {
            currentGuild.set("symbol_subs", symbol_subs);
            //mark modified to save()
            currentGuild.markModified("symbol_subs");
            currentGuild.save((err) => {
                if(err) {
                    msg.channel.send(UNKNOWN_ERROR);
                    console.error(err);
                    return;
                }
                msg.channel.send(`Removed \`${symbol}\` from alert subscription.`);
            })
           
        } else {
            // notify non existent symbol
            msg.channel.send(`You haven't subscribed to \`${symbol}\` yet fam!`);
        }
    }
};