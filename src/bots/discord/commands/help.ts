import Discord from "discord.js";
import fs from "fs";
import path from "path";
import { prefix } from "../../../config";
import { embedColors, IDiscordCommand } from "../../../types/discord";
import { createEmbed } from "../../../utils/discord";
import { HELP_HEADER } from "../strings";

module.exports = {
    name: "help",
    description: "Command help text.",
    usage: `${prefix}help`,
    execute: (msg: Discord.Message, args: string[], flags: string[]) => {
        // Create a help text to be displayed.
        let helpText: string = ``;

        const _commandFiles: string[] = fs.readdirSync(path.resolve(__dirname)).filter(file =>  file.endsWith(".js"));
        for (const file of _commandFiles) {
            // command object
            const _command: IDiscordCommand = require(path.resolve(__dirname, `${file}`));
            helpText += `**\`${prefix}${_command.name}\`** - ${_command.description} (**_\`${_command.usage}\`_**) \n`;
        }   

        //Create embed message
        let embed: Discord.MessageEmbed = createEmbed(HELP_HEADER, helpText, embedColors.MAIN);
        msg.channel.send(embed);
    }
};