
import { Base } from "../types";
import Discord, { MessageEmbed } from "discord.js";
import { endsWithBase, isSymbolInDB } from "./telegram";
import { NOT_VALID_SYMBOL_DISCORD, REMOVE_ALERT_INVALID_ALERT_SYNTAX } from "../bots/discord/strings";
import { botPicURL, botURL } from "../config";
import usdtSymbolDB from "../models/usdtDB";
import { Document } from "mongoose";
import { ISingleSymbolDocument } from "../types/models";

/**
 * Discord utility function to validate symbol.
 */

 export const validateSymbol = async (symbol: string, msg: Discord.Message): Promise<boolean> => {

    // get the symbol Base
    const base: Base | boolean = endsWithBase(symbol);
    // Check if symbol ends with BTC or USDT
    if(base === false) {
        // send not a valid symbol message.
        msg.channel.send(NOT_VALID_SYMBOL_DISCORD);
        return false;
    }

    // Check if symbol exists in either DB.
    let isInDB: boolean = await isSymbolInDB(symbol);
    if(!isInDB) {
        // send not a valid symbol message.
        msg.channel.send(NOT_VALID_SYMBOL_DISCORD);
        return false;
    }
    
    return true;
 }


 /**
  * Function to create a message embed.
  */

  export const createEmbed = (title: string, description: string, color: string, author?: boolean, timestamp?: boolean, footer?: string, image?: string, thumbnail?: string): MessageEmbed => {
    const embed: MessageEmbed = new Discord.MessageEmbed()
        .setTitle(title)
        .setDescription(description)
        .setColor(color);
        
    author ? embed.setAuthor('CryptoBOT', `${botPicURL}`, `${botURL}`) : null;
    timestamp ? embed.setTimestamp(new Date()) : null;
    image ? embed.setImage(image) : null;
    footer ? embed.setFooter(footer) : null;
    thumbnail ? embed.setThumbnail(thumbnail) : null;

    return embed;
  }


  /**
   * Function to set the client activity.
   * 
   */

   export const setClientActivity = (client: Discord.Client) => {

        setInterval(async () => {
            // get prices from DB
            const BTC_DOC: Document<ISingleSymbolDocument> | null = await usdtSymbolDB.findOne({symbol: "BTCUSDT"}).exec();
            const ETH_DOC: Document<ISingleSymbolDocument> | null = await usdtSymbolDB.findOne({symbol: "ETHUSDT"}).exec();
            if(!BTC_DOC || !ETH_DOC) return;
            let btc_price: number  = BTC_DOC.get('last_price');
            let eth_price: number  = ETH_DOC.get('last_price');

            client.user?.setActivity(`BTC @ ${btc_price}`, {type: "WATCHING"});
            if(client.user?.presence.activities.length == 0) return;
            let activity: string | undefined = client.user?.presence.activities[0].name;
    
            if(activity?.startsWith("BTC")) {
                client.user?.setActivity(`ETH @ ${eth_price}`, {type: "WATCHING"});
            } else if(activity?.startsWith("ETH")){
                client.user?.setActivity(`BTC @ ${btc_price}`, {type: "WATCHING"});
            }
        }, 30500)
   }


   /**
    * Function to get message globals.
    * 
    */

    export const getMessageGlobals = (message: Discord.Message): (string | undefined)[] => {
        // Message globals
        const guildID: string | undefined = message.guild?.id;
        const guildName: string | undefined = message.guild?.name;
        const guildChannelID: string | undefined = message.channel.id;

        return [guildID, guildName, guildChannelID];
    }; 


/**
 * Function to validate symbol and price for 2 param commands.
 */

 export const isValidArgs = (symbol: string, price: string, msg: Discord.Message): boolean => {
    if(!symbol || !price) {
        msg.channel.send(REMOVE_ALERT_INVALID_ALERT_SYNTAX);
        return false;
    }

    return true;
 }


 /**
  * Get flags for command.
  */

 export const getFlags = (args: string[]): string[] => {
    let flags: string[] = [];

    args.map((arg: string) => {
        if(arg[0] == "-" && arg[1] == "-") {
            flags.push(arg.slice(2));
        } else if(arg[0] == "-" && arg[1] !== "-") {
            flags.push(arg.slice(1));
        }
    });

    return flags;
 }