import { Message } from "discord.js";
import { ownerOnly, prefix } from "../../../config";
import { OWNER_ONLY, ALREADY_SUBSCRIBED, SUBSCRIBED, UNKNOWN_ERROR, COULDNT_UPDATE_DB } from "../strings";
import DiscordServer from "../../../models/discordServer";
import { getMessageGlobals } from "../../../utils/discord";
import { ServerDocumentResponse, IServerModel } from "../../../types/models";

module.exports = {
    name: "start",
    description: `Subscribe to all alerts. Use \`${prefix}stop\` to stop`,
    usage: `${prefix}start`,
    execute: async (msg: Message, args: Array<string>, flags: string[]) => {

        //get msg globals
        const [guildID, guildName, guildChannelID] = getMessageGlobals(msg);

        // owner only check
        if(ownerOnly && msg.author.id !== msg.guild?.ownerID) {
            msg.channel.send(OWNER_ONLY);
            return;
        }
        
        //Read the Database
        let currentGuild: ServerDocumentResponse = await DiscordServer.findOne({serverID: guildID}).exec();
        if(!currentGuild) {
            let new_server = {
                serverID: guildID,
                name: guildName,
                channels: [guildChannelID],
                symbol_subs: {},
            }

            DiscordServer.create(new_server, function (err: any, doc: IServerModel) {
                if(err) {
                    msg.channel.send(UNKNOWN_ERROR);
                    console.error(err);
                    return;
                }

                msg.channel.send(SUBSCRIBED);
                return;
            });
        }

        if(currentGuild && currentGuild!.get("channels").includes(guildChannelID)) {
            msg.channel.send(ALREADY_SUBSCRIBED);
        } else {
            currentGuild!.update({$push: {"channels": guildChannelID}}, undefined, function (err: any, res: any) {
                if(err) {
                    msg.channel.send(UNKNOWN_ERROR);
                    console.error(err);
                    return;
                }
                
                res.nModified > 0 ? msg.channel.send(SUBSCRIBED) :  msg.channel.send(COULDNT_UPDATE_DB);
            });
        }      
    } 
};