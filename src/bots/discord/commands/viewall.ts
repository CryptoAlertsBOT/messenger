import { prefix } from "../../../config";
import Discord from "discord.js";
import { createEmbed, getMessageGlobals } from "../../../utils/discord";
import DiscordServer from "../../../models/discordServer";
import { NOT_SUBSCRIBED, NO_SYMBOL_SUBS } from "../strings";
import { embedColors, IChannelSubscriptions, ISymbolSubs } from "../../../types/discord";
import { ServerDocumentResponse } from "../../../types/models";


module.exports = {
    name: "viewall",
    description: "View all current market pair subscriptions.",
    usage: `${prefix}viewall`,
    execute: async (msg: Discord.Message, args: string[], flags: string[]) : Promise<void> => {
        //get msg globals
        const [guildID, guildName, guildChannelID] = getMessageGlobals(msg);
        if(!guildChannelID) return;

        const currentGuild: ServerDocumentResponse = await DiscordServer.findOne({serverID: guildID}).exec();
        if(!currentGuild) {
            // not subscribed yet
            msg.channel.send(NOT_SUBSCRIBED);
            return;
        }

        
        const symbol_subs: ISymbolSubs = currentGuild.get("symbol_subs");
        const channel_subs: IChannelSubscriptions = symbol_subs[guildChannelID];
        // Check if channel subs exists.
        // If not then notify.
        if(!channel_subs) {
            msg.channel.send(NO_SYMBOL_SUBS);
            return;
        }   
        

        /* USDT Subscriptions */
        const USDTSubscriptions: string[] = channel_subs.usdt_subs;
        let usdt_string: string;
        usdt_string = USDTSubscriptions && USDTSubscriptions.join("\n");
        /* BTC Subscriptions */
        const BTCSubscriptions: string[] = symbol_subs[guildChannelID].btc_subs;
        let btc_string: string;
        btc_string = BTCSubscriptions && BTCSubscriptions.join("\n");

        if (USDTSubscriptions.length == 0 && BTCSubscriptions.length == 0) {
            // no Subs
            msg.channel.send(NO_SYMBOL_SUBS);
            return;
        };

        // Create Embed
        const usdt_embed: Discord.MessageEmbed = createEmbed("USDT Subscriptions", usdt_string, embedColors.BLUE);
        const btc_embed: Discord.MessageEmbed = createEmbed("BTC Subscriptions", btc_string, embedColors.ORANGE);
        
        USDTSubscriptions.length > 0 ? msg.channel.send(usdt_embed): null;
        BTCSubscriptions.length > 0 ? msg.channel.send(btc_embed): null;

    }
};