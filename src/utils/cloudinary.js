import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
cloudinary.config({
  cloud_name: process.env.CLOUNDINARY_NAME,
  api_key: process.env.CLOUNDINARY_API_KEY,
  api_secret:process.env.CLOUNDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFileUrl) => {
  try {
    if(!localFileUrl) return null
    const response = await cloudinary.uploader.upload(localFileUrl, {
      resource_type: "auto",
    });
    console.log("File uploaded successfully", response.url);
    return response;
  } catch (error) {
   fs.unlinkSync(localFileUrl) 
   return null
  }
};

export {uploadOnCloudinary}