import mongoose from 'mongoose';
import { ISingleSymbolDocument } from '../../types/models';

const Schema: typeof mongoose.Schema = mongoose.Schema;

const btcDBSchema: mongoose.Schema = new Schema({
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

export default mongoose.model<ISingleSymbolDocument>('btcSymbolDB', btcDBSchema);