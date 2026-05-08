import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Tweet } from "../models/tweet.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
const createTweet = asyncHandler(async (req, res) => {
  const { tweet } = req.body;
  if (!tweet) {
    throw new ApiError(400, "Tweet is required");
  }

  const tweetData = await Tweet.create({
    content: tweet,
    owner: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, tweetData, "Tweet created successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
  let { tweetId } = req.params;
  const { tweet } = req.body;

  if (!tweetId) {
    throw new ApiError(400, "Tweet ID is required");
  }

  if (!tweet) {
    throw new ApiError(400, "Tweet content is required");
  }

  tweetId = new mongoose.Types.ObjectId(tweetId);

  const updatedTweet = await Tweet.findOneAndUpdate(
    { _id: tweetId, owner: req.user._id }, // find tweet by id AND verify ownership
    { content: tweet },
    { new: true }
  );

  if (!updatedTweet) {
    throw new ApiError(
      404,
      "Tweet not found or you are not authorized to update it"
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedTweet, "Tweet updated successfully"));
});
const deleteTweet = asyncHandler(async (req, res) => {
   let { tweetId } = req.params;

  if (!tweetId) {
    throw new ApiError(400, "Tweet ID is required");
  }

  tweetId = new mongoose.Types.ObjectId(tweetId);

  const deletedTweet = await Tweet.findOneAndDelete(
    { _id: tweetId, owner: req.user._id },
  );

  if (!deletedTweet) {
    throw new ApiError(
      404,
      "Tweet not found or you are not authorized to delete it"
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Tweet deleted successfully"));
});



const getUserTweets = asyncHandler(async (req, res) => {});

export { createTweet, updateTweet, deleteTweet, getUserTweets };
