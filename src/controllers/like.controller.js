import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { Comments } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js";

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
      .json(
        new ApiResponse(200, { liked: false }, "Video unliked successfully")
      );
  }

  const videoLike = await Like.create({
    video: videoObjectId,
    likedBy: req.user._id,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { liked: true, like: videoLike },
        "Video liked successfully"
      )
    );
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!commentId || !mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(400, "Valid comment ID is required");
  }

  const commentObjectId = new mongoose.Types.ObjectId(commentId);

  const comment = await Comments.findById(commentObjectId);
  if (!comment) {
    throw new ApiError(404, "Comment does not exist");
  }

  const existingLike = await Like.findOneAndDelete({
    comment: commentObjectId,
    likedBy: req.user._id,
  });

  if (existingLike) {
    return res
      .status(200)
      .json(
        new ApiResponse(200, { liked: false }, "Comment unliked successfully")
      );
  }

  const commentLike = await Like.create({
    comment: commentObjectId,
    likedBy: req.user._id,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { liked: true, like: commentLike },
        "Comment liked successfully"
      )
    );
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!tweetId || !mongoose.Types.ObjectId.isValid(tweetId)) {
    throw new ApiError(400, "Valid Tweet ID is required");
  }

  const tweetObjectId = new mongoose.Types.ObjectId(tweetId);

  const tweet = await Tweet.findById(tweetObjectId);
  if (!tweet) {
    throw new ApiError(404, "Tweet does not exist");
  }

  const existingLike = await Like.findOneAndDelete({
     tweet: tweetObjectId,
    likedBy: req.user._id,
  });

  if (existingLike) {
    return res
      .status(200)
      .json(
        new ApiResponse(200, { liked: false }, "Tweet unliked successfully")
      );
  }

  const tweetLike = await Like.create({
    tweet: tweetObjectId,
    likedBy: req.user._id,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { liked: true, like: tweetLike },
        "Tweet liked successfully"
      )
    );
});

const getLikedVideosCount = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Valid video ID is required");
    }

    const count = await Like.countDocuments({ video: videoId });

    return res
        .status(200)
        .json(new ApiResponse(200, { count }, "Video like count fetched successfully"));
});
const getLikedTweetCount = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!tweetId || !mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new ApiError(400, "Valid Tweet ID is required");
    }

    const count = await Like.countDocuments({ tweet: tweetId });

    return res
        .status(200)
        .json(new ApiResponse(200, { count }, "Tweet like count fetched successfully"));
});

const getLikedCommentsCount = asyncHandler(async (req, res) => {
    const {commentId} = req.params;

    if (!commentId || !mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Valid Comment ID is required");
    }

    const count = await Like.countDocuments({ comment: commentId });

    return res
        .status(200)
        .json(new ApiResponse(200, { count }, "Comment like count fetched successfully"));
});

const getLikedVideos = asyncHandler(async (req, res) => {

});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos ,getLikedVideosCount,getLikedCommentsCount,getLikedTweetCount};
