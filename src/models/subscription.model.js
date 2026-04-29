import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema(
    {
        subscriber:{
            type:Schema.Types.ObjectId,
            ref:"User"
        },
        channel:{
            type:Schema.Types.ObjectId,
            ref:"User"
        }
    }
    , { Timestamp: true });

export const Subscription = Schema.model("Subscription", subscriptionSchema);
