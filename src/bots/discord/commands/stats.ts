import Discord from "discord.js";
import { prefix } from "../../../config";
import { ISymbolStats } from "../../../types";
import { embedColors } from "../../../types/discord";
import { getSymbolStats } from "../../../utils/api";
import { createEmbed, validateSymbol } from "../../../utils/discord";
import { NOT_VALID_SYMBOL_DISCORD } from "../strings";

module.exports = {
    name: "stats",
    description: "Get statistics for the provided market pair.",
    usage: `${prefix}stats BTCUSDT`,
    execute: async (msg: Discord.Message, args: string[], flags: string[]) => {
        // parse the symbol from the args
        if (args.length == 0) {
            msg.channel.send(NOT_VALID_SYMBOL_DISCORD);
            return;
        }
        const symbol: string = args[0].toUpperCase();
        
        // check if the symbol is valid
        const isSymbolValid: boolean = await validateSymbol(symbol, msg);
        if(!isSymbolValid) return;

        // get the symbol stats
        let stats: Partial<ISymbolStats> = await getSymbolStats(symbol);
        // create message embed
        let message: string = `Current Price:  **${stats.lastPrice}**\n24H high:  **${stats.highPrice}**\n24H Low:  **${stats.lowPrice}**\n24H change:  **${stats.priceChangePercent}**%\n24H Volume:  **${stats.volume}**\nWeighted Avg. Price:  **${stats.weightedAvgPrice}**`;
        const embed = createEmbed(`${symbol} STATS`, message, embedColors.STATS);
        // send stats
        msg.channel.send(embed);
    }
};
