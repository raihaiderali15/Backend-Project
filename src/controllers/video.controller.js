import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  removeFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import fs from "fs";
import mongoose from "mongoose";
const diskcleanUp = (...path) => {
  path.forEach((element) => {
    if (element && fs.existsSync(element)) {
      fs.unlinkSync(element);
    }
  });
};
const publishVideo = asyncHandler(async (req, res) => {
  const logdinUser = req.user;
  if (!logdinUser) {
    throw new ApiError(401, "User is not logdin");
  }
  const { title, description } = req.body;
  const field = { title, description };
  for (const [name, value] of Object.entries(field)) {
    if (!value || value.trim() === "") {
      throw new ApiError(400, `${name} is required`);
    }
  }

  const localPathofvideo = req.files?.video?.[0]?.path;
  const localPathofThumbnail = req.files?.thumbnail?.[0]?.path;
  if (!localPathofThumbnail || !localPathofvideo) {
    throw new ApiError(400, "Video or thumbnail is required");
  }
  const videoUrl = await uploadOnCloudinary(localPathofvideo);
  const thumbnailUrl = await uploadOnCloudinary(localPathofThumbnail);
  if (!videoUrl || !thumbnailUrl) {
    diskcleanUp(localPathofvideo, localPathofThumbnail);
    throw new ApiError(500, "upload of video or thumbnail is unsuccessful");
  }
  const video = await Video.create({
    title,
    description,
    videoFile: videoUrl.url,
    thumbnail: thumbnailUrl.url,
    owner: logdinUser._id,
    duration: videoUrl.duration,
    videoPublicId: videoUrl.public_id,
    thumbnailPublicId: thumbnailUrl.public_id,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, video, "Vido uploaded successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const video = await Video.findById(id);
  if (!video) {
    throw new ApiError(400, "Video not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetch successfully"));
});

const uptadeVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const { id } = req.params;
  console.log(req.file);
  const pathOfThumbnail = req.file?.path;
  if (!title && !description && !pathOfThumbnail) {
    throw new ApiError(
      400,
      "Title or description or thumbnail  is requried to chnange details"
    );
  }
  const thumbnail = await uploadOnCloudinary(pathOfThumbnail);
  if (fs.existsSync(pathOfThumbnail)) fs.unlinkSync(pathOfThumbnail);
  const fieldsToUptade = {};
  if (title) fieldsToUptade.title = title;
  if (description) fieldsToUptade.description = description;
  if (thumbnail) fieldsToUptade.thumbnail = thumbnail.url;
  const video = await Video.findOneAndUpdate(
    { _id: id, owner: req.user._id },
    { $set: fieldsToUptade },
    { returnDocument: "after" }
  );
  console.log(video);
  if (!video) {
    throw new ApiError(404, "Video not found or unauthorized");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, video, "Vidoe detail Uptaded successfully"));
});
const deletVido = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const video = await Video.findOneAndDelete({ _id: id, owner: req.user._id });
  if (!video) {
    throw new ApiError(400, "Video is not found or already deleted");
  }
  console.log(video.videoPublicId, video.thumbnailPublicId);
  await removeFromCloudinary(video.videoPublicId, "video");
  await removeFromCloudinary(video.thumbnailPublicId, "image");
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video deleted succesfully"));
});
const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video is not available");
  }
  const uptadeVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        isPublished: !video.isPublished,
      },
    },
    { returnDocument: "after" }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        uptadeVideo,
        `video is ${uptadeVideo.isPublished ? "Published" : "unPublished"} Successfully`
      )
    );
});
const getAllVideos = asyncHandler(async (req, res) => {
  const { query, sortBy, sortType, userId } = req.query;

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  // Match Stage
  const matchStage = {
    isPublished: true,
  };

  // Filter by owner
  if (userId) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new ApiError(400, "Invalid User Id");
    }

    matchStage.owner = new mongoose.Types.ObjectId(userId);
  }

  // Search query
  if (query) {
    matchStage.$or = [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ];
  }

  // Sorting
  const allowedSortFields = ["views", "duration", "createdAt"];

  const sortStage = {};

  if (allowedSortFields.includes(sortBy)) {
    sortStage[sortBy] = sortType === "asc" ? 1 : -1;
  } else {
    sortStage.createdAt = -1;
  }

  // Aggregate Pipeline
  const aggregate = Video.aggregate([
    { $match: matchStage },

    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "ownerDetails",

        pipeline: [
          {
            $project: {
              username: 1,
              fullname: 1,
              email: 1,
              avatar: 1,
              coverimage: 1,
            },
          },
        ],
      },
    },

    {
      $addFields: {
        ownerDetails: {
          $first: "$ownerDetails",
        },
      },
    },

    { $sort: sortStage },
  ]);

  // Pagination Options
  const options = {
    page,
    limit,
  };

  // Paginated Result
  const result = await Video.aggregatePaginate(aggregate, options);

  // No Videos Found
  if (!result.docs.length) {
    throw new ApiError(404, "No videos found");
  }

  // Response
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        videos: result.docs,
        total: result.totalDocs,
        totalPages: result.totalPages,
        currentPage: result.page,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage,
      },
      "Videos fetched successfully"
    )
  );
});
export {
  publishVideo,
  uptadeVideo,
  getVideoById,
  deletVido,
  togglePublishStatus,
  getAllVideos,
};
