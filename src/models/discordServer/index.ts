import mongoose from "mongoose";
import { IServerModel } from "../../types/models";

const Schema = mongoose.Schema;

const serverSchema: mongoose.Schema = new Schema({
    serverID: {type: String, unique: true},
    name: {type: String},
    channels: [String],
    symbol_subs: Schema.Types.Mixed,
}, {timestamps: true});

export default mongoose.model<IServerModel>("DiscordServer", serverSchema);