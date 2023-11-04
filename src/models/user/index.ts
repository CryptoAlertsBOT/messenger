import mongoose, { Schema } from "mongoose";
import { UserModel } from "../../types/models";

const userSchema: mongoose.Schema = new Schema({
        userID: {type: Number, required: true, unique: true},
        username: {type: String, unique: false},
        chatType: {type: String, required: true},
        first_name: String,
        last_name: String,
        usdt_subs: [String],
        btc_subs: [String],
        usdt_alerts: Schema.Types.Mixed,
        btc_alerts: Schema.Types.Mixed
}, {timestamps: true});


// export model.
export default mongoose.model<UserModel>("User", userSchema);