import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"
import { Comments } from "../models/comment.model.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Valid video ID is required");
    }

    const videoObjectId = new mongoose.Types.ObjectId(videoId);

    const video = await Video.findById(videoObjectId);
    if (!video) {
        throw new ApiError(404, "Video does not exist");
    }

    const existingLike = await Like.findOneAndDelete({
        video: videoObjectId,
        likedBy: req.user._id,
    });

    if (existingLike) {
        return res
            .status(200)
            .json(new ApiResponse(200, { liked: false }, "Video unliked successfully"));
    }

    const videoLike = await Like.create({
        video: videoObjectId,
        likedBy: req.user._id,
    });

    return res
        .status(200)
        .json(new ApiResponse(200, { liked: true, like: videoLike }, "Video liked successfully"));
});


const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    if(!commentId ||! new mongoose.Types.ObjectId.isValid(commentId)){
        throw new ApiError(400,"Comment Id is inValid")
    }
    const comment=await Comments.findById(commentId);
    if(!comment){
        throw new ApiError(400,"Comment does not exist")
    }
    const existingLike=await Like.findOneAndDelete({comment:commentId,likedBy:req.user._id})
    if(!existingLike){
        const commentLike=await Like.create({comment:commentId,likedBy:user.req._id})
        return res.status(200)
        .json(new ApiResponse(200,{liked:true,commentLike},"Comment like successfully"))
    }
    return res.status(200)
    .json(new ApiResponse(200,{liked:false},"Comment unliked Successfully"))

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}