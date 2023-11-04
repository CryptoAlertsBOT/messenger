import Discord from "discord.js";
import { prefix } from "../../../config";
import { Base } from "../../../types";
import {IDiscordSubscription } from "../../../types/discord";
import { getMessageGlobals, validateSymbol } from "../../../utils/discord";
import { endsWithBase } from "../../../utils/telegram";
import { NOT_VALID_SYMBOL_DISCORD, UNKNOWN_ERROR } from "../strings";
import DiscordServer from "../../../models/discordServer";
import { IServerModel, IServerSchema, ServerDocumentResponse } from "../../../types/models";


module.exports = {
    name: "add",
    description: "Add custom market pair alert to yoru channel/server.",
    usage: `${prefix}add BTCUSDT`,
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
        const currentGuild: ServerDocumentResponse = await DiscordServer.findOne({serverID: guildID}).exec();

        //if Server doesn't exist already.
        if(!currentGuild) {
            
            // create subscription
            let subscription: IDiscordSubscription;
            base == Base.USDT ? 
            subscription = {
                [guildChannelID]: {
                    usdt_subs: [symbol],
                    btc_subs: [],
                }
            } : 

            subscription = {
                [guildChannelID]: {
                    usdt_subs: [],
                    btc_subs: [symbol],
                }
            }

            // add the server to the database.
            let new_server: IServerSchema = {
                serverID: guildID,
                name: guildName,
                channels: [],
                symbol_subs: subscription,
                symbol_alerts: {
                    usdt_alerts: {},
                    btc_alerts: {}
                }
            };
            DiscordServer.create(new_server, function (err: any, doc: IServerModel) {
                if(err) {
                    msg.channel.send(UNKNOWN_ERROR);
                    console.error(err);
                    return;
                }

                msg.channel.send(`Added **${symbol}** alerts to this channel. Send \`${prefix}remove ${symbol}\` to remove.`);
            });

            return;
        } 

        // if Exists, then check if channel is listed in symbol_subs
        let symbol_subs = currentGuild!.get("symbol_subs");
        if(!symbol_subs) {
            symbol_subs = {};
        }

    
        if(!Object.keys(symbol_subs).includes(guildChannelID)) {
            // add this channel to the symbol subs.
            let newChannelSub;
            base === Base.USDT ?
            newChannelSub = {
                usdt_subs: [symbol],
                btc_subs: [],
            } :
            newChannelSub = {
                usdt_subs: [],
                btc_subs: [symbol],
            }
            
            symbol_subs[guildChannelID] = newChannelSub;
            //Set path to new values.
            currentGuild!.set("symbol_subs", symbol_subs);
            // Mark modified Mixed path.
            currentGuild!.markModified("symbol_subs");
            currentGuild!.save(function(err) {
                if(err) {
                    msg.channel.send(UNKNOWN_ERROR);
                    console.error(err);
                    return;
                }
                msg.channel.send(`Added **${symbol}** alerts to this channel. Send \`${prefix}remove ${symbol}\` to remove.`);
                return;
            })
        } else if((base == Base.USDT && symbol_subs[guildChannelID].usdt_subs.includes(symbol)) || 
                (base == Base.BTC && symbol_subs[guildChannelID].btc_subs.includes(symbol))) {

                //If yes then send message alert.
                msg.channel.send(`**\`${symbol}\`** already exists in this channel subscription.`);
                return;
            } else {
            // if not then add the symbol to the subscription database for that channel. -> Notify the channel of addition.
            base == Base.USDT ? 
            symbol_subs[guildChannelID].usdt_subs.push(symbol) :
            symbol_subs[guildChannelID].btc_subs.push(symbol);

            // set path to new values.
            currentGuild!.set("symbol_subs", symbol_subs);
            // Mark modified
            currentGuild!.markModified("symbol_subs");
            currentGuild!.save(function(err) {
                if(err) {
                    msg.channel.send(UNKNOWN_ERROR);
                    console.error(err);
                    return;
                }
                msg.channel.send(`Added **${symbol}** alerts to this channel. Send \`${prefix}remove ${symbol}\` to remove.`);
                return;
            });
            }
        
        


    }
};