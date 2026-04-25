import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import fs from "fs";
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
   if(localPathOfCoverImage)fs.unlinkSync(localPathOfCoverImage);

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
    await User.findByIdAndUpdate(req.user._id,{
        $unset:{refreshToken:1}
    }
)
const cookiesOptions={
    httpOnly:true,
    secure:true
}
return res.status(200)
.clearCookie("refreshToken",cookiesOptions)
.clearCookie("accessToken",cookiesOptions)
.json(
    new ApiResponse(200,{},"User logout Successfully")
)

});

export { registerUser, loginUser, logoutUser };
