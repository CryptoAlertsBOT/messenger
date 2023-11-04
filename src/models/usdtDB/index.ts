import mongoose from "mongoose";
import { ISingleSymbolDocument } from "../../types/models";

const Schema = mongoose.Schema;
const usdtDBSchema: mongoose.Schema = new Schema({
    symbol: {
        type: String,
        required: true,
        unique: true,
    },
    last_price: {
        type: Number,
        require: true,
    },
    change: {
        type: Number,
        required: true,
    },
    last_triggered: {
        type: Date,
        required: true,
    }
}, {timestamps: true});

export default mongoose.model<ISingleSymbolDocument>("usdtSymbolDB", usdtDBSchema);