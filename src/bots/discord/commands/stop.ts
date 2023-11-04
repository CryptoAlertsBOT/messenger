import { Message } from "discord.js";
import { ownerOnly, prefix } from "../../../config";
import { OWNER_ONLY, REMOVED_SUB, UNKNOWN_ERROR, NOT_SUBSCRIBED } from "../strings";
import DiscordServer from "../../../models/discordServer";

module.exports =  {
    name: "stop",
    description: `Unsubscribe from service. Use \`${prefix}start\` to restart.`,
    usage: `${prefix}stop`,
    execute: async (msg: Message, args: string[], flags: string[]) : Promise<void> => {

        // Message globals
        const guildID: string | undefined = msg.guild?.id;
        const guildName: string | undefined = msg.guild?.name;
        const guildChannelID: string | undefined = msg.channel.id;

        let deleteServer: boolean = false;

        // owner only check
        if(ownerOnly && msg.author.id !== msg.guild?.ownerID) {
            msg.channel.send(OWNER_ONLY);
            return;
        }

        //Check 'all'
        if (args.includes('all')) {
            deleteServer = true;
        }

        //Read the Database
        let update: Object = {$pull: {'channels': guildChannelID}};
        //@ts-ignore
        DiscordServer.findOneAndUpdate({channels: {$in: [guildChannelID]}}, update, {rawResult: true}, function (err: any, res: any) {
            if(err) {
                msg.channel.send(UNKNOWN_ERROR);
                console.error(err);
                return;
            }
            res.lastErrorObject.n > 0 ? msg.channel.send(REMOVED_SUB) :  msg.channel.send(NOT_SUBSCRIBED);
        });
    }
};