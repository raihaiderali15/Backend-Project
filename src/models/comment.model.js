import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentSchema= new mongoose.Schema(
    {
        content:{
            type:String,
            required:true,
            trim:true
        },
        owner:{
            type: mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true
        },
        video:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Video",
            required:true
        }

    }
    ,{timestamps:true})
    commentSchema.plugin(mongooseAggregatePaginate)

export const Comments=mongoose.model("Comments",commentSchema)