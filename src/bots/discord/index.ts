import * as Discord from "discord.js";
import fs from "fs";
import path from "path";

import { prefix } from "../../config";
import { MessageType } from "../../types/discord";
import {getFlags, setClientActivity } from "../../utils/discord";

export const discord: Discord.Client = new Discord.Client();
//@ts-ignore
discord.commands = new Discord.Collection();

// Log to console on client ready.
discord.once('ready', async () => {
    console.log("Discord client ready.".yellow);
    //set Discord client activity
    setClientActivity(discord);
});

//login to discord.
if(!process.env.DISCORD_TOKEN) process.exit(100);
discord.login(process.env.DISCORD_TOKEN);


/**
 *  
 *  Validate all messages sent to the bot.
 * 
 */

discord.on("message", async (msg: Discord.Message): Promise<void> => {
    // return if not a command or message is by a bot.
    // convert content to lower case in order to void indiscrepencies with user input.
    msg.content = msg.content.toLowerCase();
    if(!msg.content.startsWith(prefix) || msg.author.bot) return;

    // parse the message
    let args: string[] = msg.content.slice(prefix.length).trim().split(/ +/);
    args = args.map(arg => arg.toLowerCase());
    const command: string = args[0].toLowerCase();

    //remove the command to hold only the args
    args.shift();
    let flags = getFlags(args);

    // If text type is `text` then log commands.
    if(msg.channel.type === MessageType.Text) {

        // get all the files in the `commands` folder.
        const commandFiles = fs.readdirSync(path.resolve(__dirname, "./commands")).filter(file => file.endsWith(".js"));
        for (const file of commandFiles) {
            const _command = require(`./commands/${file}`);
            //@ts-ignore
            discord.commands.set(_command.name, _command);
        }
        //@ts-ignore
        if(!discord.commands.has(command)) return;
        try {
            //@ts-ignore
           discord.commands.get(command).execute(msg, args, flags);
        } catch(err: any) {
            console.error(`Error processing command - ${command}\nReason- ${err.message}`);
        }
    }
});

