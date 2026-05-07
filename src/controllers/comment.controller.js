import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Comments } from "../models/comment.model.js";
import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
const addComment = asyncHandler(async (req, res) => {
  //get the comment from the request body
  const { comment } = req.body;
  //check if the comment is empty
  if (!comment) {
    throw new ApiError("Comment is required", 400);
  }
  //get the video id from the request params
  const videoId = req.params.videoId;
  // get user id from the request user object
  const userId = req.user._id;
  //create a new comment
  const newComment = await Comments.create({
    content: comment,
    owner: userId,
    video: videoId,
  });
  //send the response
  return res
    .status(201)
    .json(new ApiResponse(true, newComment, "Comment added successfully"));
});
//update comment
const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!commentId) {
    throw new ApiError("Comment ID is required", 400);
  }
  const { comment } = req.body;
  if (!comment) {
    throw new ApiError("Comment is required", 400);
  }
  const updatedComment = await Comments.findByIdAndUpdate(
    commentId,
    { content: comment },
    { returnDocument: "after" }
  );
  return res
    .status(200)
    .json(
      new ApiResponse(true, updatedComment, "Comment updated successfully")
    );
});
// delete comment
const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!commentId) {
    throw new ApiError(400, "Comment ID is required");
  }
  const deletedComment = await Comments.findByIdAndDelete(commentId);
  if (!deletedComment) {
    throw new ApiError(404, "Comment not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(true, {}, "Comment deleted successfully"));
});
//get all comments for a video
const getAllComments = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const { videoId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Video ID is not valid");
  }
  const matchStage = {
   video:new mongoose.Types.ObjectId(videoId)
  };

  const commentsAggregate = Comments.aggregate([
    { $match: matchStage },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "commentOwner",
        pipeline: [
          {
            $project: {
              username: 1,
              fullname: 1,
              avatar: 1,
              coverimage: 1,
              email: 1,
              createdAt: 1,
              updatedAt: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        commentOwner: { $first: "$commentOwner" },
      },
    },
    {
      $sort: { createdAt: -1 },
    },
  ]);
  const options = {
    page,
    limit,
  };
  const comments = await Comments.aggregatePaginate(commentsAggregate, options);
  if (!comments.docs.length) {
  throw new ApiError(404, "No comments found");
}
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        comments: comments.docs,
        total: comments.totalDocs,
        totalPages: comments.totalPages,
        currentPage: comments.page,
        hasNextPage: comments.hasNextPage,
        hasPrevPage: comments.hasPrevPage,
      },
      "All comments fetched Successfully"
    )
  );
  
});
export { addComment, updateComment, deleteComment, getAllComments };
