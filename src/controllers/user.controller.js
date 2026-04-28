import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import fs from "fs";
import jwt from "jsonwebtoken";
const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access and refresh token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, fullname, password } = req.body;
  const localPathOfAvatar = req.files?.avatar?.[0]?.path;
  const localPathOfCoverImage = req.files?.coverImage?.[0]?.path;
  //This is for registering User
  //getting data from user
  const field = { username, email, fullname, password };
  for (const [name, value] of Object.entries(field)) {
    if (!value || value.trim() === "") {
      throw new ApiError(400, `${name} is required`);
    }
  }

  //checking for images of avatar and coverImage

  if (!localPathOfAvatar) {
    throw new ApiError(400, "Avatar is required");
  }

  // checking if user already exsist

  const exsistingUser = await User.findOne({ $or: [{ username }, { email }] });
  if (exsistingUser) {
    fs.unlinkSync(localPathOfAvatar);
    if (localPathOfCoverImage) fs.unlinkSync(localPathOfCoverImage);

    throw new ApiError(409, "User with this name or email already exist");
  }

  //uploading it to cloudinary
  const avatar = await uploadOnCloudinary(localPathOfAvatar);
  const coverImage = await uploadOnCloudinary(localPathOfCoverImage);
  if (!avatar) {
    throw new ApiError(400, "Avatar is required");
  }
  // creating an object onto dp
  const user = await User.create({
    username: username.toLowerCase(),
    email,
    password,
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "Something went Wrong while registering the user");
  }
  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User is Created Successfully"));
});

//For User to login
const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  if (!username && !email) {
    throw new ApiError(400, "username or email is required");
  }

  //Checking the User
  const user = await User.findOne({ $or: [{ username }, { email }] });
  if (!user) {
    throw new ApiError(404, "User Not Found");
  }
  // Checking the password
  const correctPassword = await user.isPasswordCorrect(password);
  if (!correctPassword) {
    throw new ApiError(401, "Invalid Credendials");
  }

  //genrating access and refresh Token
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );
  const logginUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  //sending data in cookies
  const cookiesOptions = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(201)
    .cookie("accessToken", accessToken, cookiesOptions)
    .cookie("refreshToken", refreshToken, cookiesOptions)
    .json(
      new ApiResponse(
        200,
        {
          user: logginUser,
          accessToken,
          refreshToken,
        },
        "User created Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  //deleting refresh token from db
  await User.findByIdAndUpdate(req.user._id, {
    $unset: { refreshToken: 1 },
  });
  const cookiesOptions = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("refreshToken", cookiesOptions)
    .clearCookie("accessToken", cookiesOptions)
    .json(new ApiResponse(200, {}, "User logout Successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    const incomingToken =
      req.cookies?.refreshToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    if (!incomingToken) {
      throw new ApiError(401, "Unauthorized User");
    }
    const decoded = jwt.verify(incomingToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded._id);
    if (!user) {
      throw new ApiError(401, "Invalid Refresh Token");
    }
    if (user.refreshToken !== incomingToken) {
      throw new ApiError(401, "this refresh token no longer exsist");
    }
    const { refreshToken, accessToken } = await generateAccessAndRefreshToken(
      user._id
    );
    const cookiesOptions = {
      httpOnly: true,
      secure: true,
    };
    return res
      .status(200)
      .cookie("refreshToken", refreshToken, cookiesOptions)
      .cookie("accessToken", accessToken, cookiesOptions)
      .json(
        new ApiResponse(
          200,
          { refreshToken, accessToken },
          "Token refresh successfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, error.message || "Something went wrong");
  }
});

const uptadePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  if (newPassword !== confirmPassword) {
    throw new ApiError(
      401,
      "New password is not matching with confirm Password"
    );
  }
  const user = await User.findById(req.user._id);
  const validPassword = await user.isPasswordCorrect(oldPassword);
  if (!validPassword) {
    throw new ApiError(401, "Invalid Password");
  }
  user.password = newPassword;
  await user.save();
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password Changed Successfully"));
});
const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Get user information successfully"));
});
const uptadeAccountDetail = asyncHandler(async (req, res) => {
  const { username, fullname, email } = req.body;
  if (!username && !fullname && !email) {
    throw new ApiError(401, "Username or Email or Fullname is required");
  }
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      email,
      fullname,
      username,
    },
    {
      new: true,
    }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Information Uptaded Succssfully"));
});
const uptadeAvatar=asyncHandler(async(req,res)=>{

        const localPathOfAvatar=req.file?.path
      
        if(!localPathOfAvatar){
          throw new ApiError(401,"Please upload the avatar photo")
        }
   const avatar= await  uploadOnCloudinary(localPathOfAvatar);
   if(!avatar){
    throw new ApiError(500,"Problem occur while uploading to cloundinary")
   }
   const user= await User.findByIdAndUpdate(req.user._id,{
    avatar:avatar.url
   },{new:true}).select("-password")
   res.status(200)
   .json(
    new ApiResponse(200,user,"Avatar Uptaded Successfully")
   )
})

const uptadeCoverImage=asyncHandler(async(req,res)=>{
        console.log(req.file)
        const localPathOfCoverImage=req.file?.path
        console.log(localPathOfCoverImage)
        if(!localPathOfCoverImage){
          throw new ApiError(401,"Please upload the Cover photo")
        }
   const coverImage= await  uploadOnCloudinary(localPathOfCoverImage);
   if(!coverImage){
    throw new ApiError(500,"Problem occur while uploading to cloundinary")
   }
  const user= await User.findByIdAndUpdate(req.user._id,{
    coverimage:coverImage.url
   },{new:true}).select("-password")
   res.status(200)
   .json(
    new ApiResponse(200,user,"CoverImage Uptaded Successfully")
   )
})
export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  uptadePassword,
  getCurrentUser,
  uptadeAccountDetail,
  uptadeAvatar,
  uptadeCoverImage
};
