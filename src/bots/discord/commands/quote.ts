import Discord from  "discord.js";
import { prefix } from "../../../config";
import { Base } from "../../../types";
import { embedColors } from "../../../types/discord";
import { getSymbolPrice } from "../../../utils";
import { createEmbed, validateSymbol } from "../../../utils/discord";
import { endsWithBase } from "../../../utils/telegram";
import { NOT_VALID_SYMBOL_DISCORD } from "../strings";

module.exports = {
    name: "quote",
    description: "Quotes a price for the specified market pair.",
    usage: `${prefix}quote BTCUSDT`,
    execute: async (msg: Discord.Message, args: string[], flags: string[]) => {

        // parse the symbol from the arguments
        // Check if symbol is passed 
        if (args.length == 0) {
            msg.channel.send(NOT_VALID_SYMBOL_DISCORD);
            return;
        }
        const symbol: string | undefined = args[0].toUpperCase();
        const isValidSymbol: boolean = await validateSymbol(symbol, msg);

        if(!isValidSymbol) return;
        const base: Base | boolean = endsWithBase(symbol);
         // Get the price quote
        const price: number | null = await getSymbolPrice(symbol, base as Base);

        // Send message in the channel after creating an embed message.
        const quote = createEmbed(symbol, `Current price: **${price}** ${base as Base}`, embedColors.MAIN);
        msg.channel.send(quote);
    }
}
