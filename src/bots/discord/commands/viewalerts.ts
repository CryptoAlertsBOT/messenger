import { prefix } from "../../../config";
import Discord from "discord.js";
import { createEmbed, getMessageGlobals } from "../../../utils/discord";
import { embedColors, IDiscordSymbolAlert } from "../../../types/discord";
import { NO_ACTIVE_ALERTS } from "../strings";
import DiscordUSDTAlert from "../../../models/usdtAlert";
import DiscordBTCAlert from "../../../models/btcAlert";
import mongoose from "mongoose";

module.exports = {
    name: "viewalerts",
    description: "View all the alerts set by you.",
    usage: `${prefix}viewalerts`,
    execute: async (msg: Discord.Message, args: string[], flags: string[]) => {
        //get msg globals
        const [guildID, guildName, guildChannelID] = getMessageGlobals(msg);
        if(!guildChannelID) return;
        // Get the message author id.
        const authorID: string = msg.author.id;
        const authorUsername: string = msg.author.username;
        const authorAvatar: string | null = msg.author.displayAvatarURL();

        // for symbol in respective base alerts,
        let USDTAlerts: mongoose.Document<Partial<IDiscordSymbolAlert>>[] = await DiscordUSDTAlert.find({"userID": authorID}, {"symbol": 1, "alert_price": 1, "guildName": 1, "_id": 0}).exec();
        let BTCAlerts: mongoose.Document<Partial<IDiscordSymbolAlert>>[] = await DiscordBTCAlert.find({"userID": authorID}, {"symbol": 1, "alert_price": 1, "guildName": 1, "_id": 0}).exec();
        let hasUSDTAlerts: boolean = USDTAlerts.length > 0;
        let hasBTCAlerts: boolean = BTCAlerts.length > 0;

        // Send an embed message with all the symbol - price in the list.
        let btc_embed: Discord.MessageEmbed | null;
        let usdt_embed: Discord.MessageEmbed | null;
        if(hasUSDTAlerts) {
            usdt_embed = new Discord.MessageEmbed()
            .setDescription('All **USDT** Alerts that you have set.')
            .setColor(embedColors.BLUE)
            .setTimestamp()
            .setAuthor(authorUsername, authorAvatar);
            
            USDTAlerts && USDTAlerts.map((alert) => {
                usdt_embed?.addField(alert.get("symbol"), alert.get("alert_price"), true);
            });
            msg.channel.send(usdt_embed);
        }
        
        if(hasBTCAlerts) {
            btc_embed = new Discord.MessageEmbed()
            .setDescription('All **BTC** Alerts that you have set.')
            .setColor(embedColors.ORANGE)
            .setTimestamp()
            .setAuthor(authorUsername, authorAvatar);
            
            
            BTCAlerts && BTCAlerts.map((alert) => {
                btc_embed?.addField(alert.get("symbol"), alert.get("alert_price"), true);
            });
            msg.channel.send(btc_embed);
        }
        
        if(!hasUSDTAlerts && !hasBTCAlerts) msg.channel.send(NO_ACTIVE_ALERTS);
    }
}