import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
const registerUser = asyncHandler(async (req, res) => {
    const {username,email,fullname,password}=req.body
//getting data from user
    const field={username,email,fullname,password}
    for (const [name,value] of Object.entries(field)) {
        if(!value || value.trim()===""){
            throw new ApiError(400,`${name} is required`)
        }
    }
// checking if user already exsist

const exsistingUser= await User.findOne({$or:[{username},{email}]})
if(exsistingUser){
    throw new ApiError(409,"User with this name or email already exist")
}
//checking for images of avatar and coverImage
const localPathOfAvatar=req.files?.avatar?.[0]?.path
const localPathOfCoverImage=req.files?.coverImage?.[0]?.path
if(!localPathOfAvatar){
    throw new ApiError(400,"Avatar is required")
}

//uploading it to cloudinary
 const avatar=await uploadOnCloudinary(localPathOfAvatar)
 const coverImage= await uploadOnCloudinary(localPathOfCoverImage)
 if(!avatar){
    throw new ApiError(400,"Avatar is required")
}
// creating an object onto dp
const user=await User.create({
    username:username.toLowerCase(),
    email,
    password,
    fullname,
    avatar:avatar.url,
    coverImage:coverImage?.url||"",
})



const createdUser=await User.findById(user._id).select("-password -refreshToken")
console.log("created user",createdUser)
if(!createdUser){
    throw new ApiError(500,"Something went Wrong while registering the user")
}
return res.status(201).json(
   new ApiResponse(201,createdUser,"User is Created Successfully")
)
})


export default registerUser;
