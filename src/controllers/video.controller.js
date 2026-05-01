import asyncHandler from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";
import {Video} from "../models/video.model.js"
import fs from "fs"
const diskcleanUp=(...path)=>{
        path.forEach(element => {
            if(element && fs.existsSync(element) ){
                fs.unlinkSync(element)
            }            
        });
}
const publishVideo=asyncHandler(async(req,res)=>{
    const logdinUser=req.user
    if(!logdinUser){
        throw new ApiError(401,"User is not logdin")
    }
    const {title,description}=req.body
    const field={title,description}
    for(const [name,value] of Object.entries(field)){
        if(!value || value.trim()===""){
            throw new ApiError(400,`${name} is required`)
        }
    }
    console.log(req.files)
    const localPathofvideo=req.files?.video?.[0]?.path
    const localPathofThumbnail=req.files?.thumbnail?.[0]?.path
    if(!localPathofThumbnail || !localPathofvideo){
        throw new ApiError(400,"Video or thumbnail is required")
    }
      const videoUrl= await uploadOnCloudinary(localPathofvideo)
      const thumbnailUrl=await uploadOnCloudinary(localPathofThumbnail)
  
      if(!videoUrl || !thumbnailUrl){
         diskcleanUp(localPathofvideo,localPathofThumbnail)
        throw new ApiError(500,"upload of video or thumbnail is unsuccessful")
      }
      console.log(videoUrl.duration,"duration")
      const video= await Video.create(
        {
            title,
            description,
            videoFile:videoUrl.url,
            thumbnail:thumbnailUrl.url,
            owner:logdinUser._id,
            duration:videoUrl.duration,
        }
    )
      return res.status(200)
      .json(
       new ApiResponse(200,video,"Vido uploaded successfully")
      )
})



export {publishVideo}