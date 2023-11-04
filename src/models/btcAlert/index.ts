import mongoose from "mongoose";

const Schema = mongoose.Schema;

const btcAlertSchema: mongoose.Schema = new Schema({
    symbol: {
        type: String,
        required: true,
    },
    alert_price: {
        type: Number,
        required: true,
    },
    userID: {
        type: String,
        required: true,
    },
    price_when_set: {
        type: Number,
        required: true,
    },
    channelID: {
        type: String,
    },
    guildID: {
        type: String,
        required: true,
    },
    guildName: {
        type: String,
        required: true,
    }
}, {timestamps: true});

export default mongoose.model('discordBTCAlert', btcAlertSchema);