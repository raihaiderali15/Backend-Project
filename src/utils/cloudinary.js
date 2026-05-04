import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
cloudinary.config({
  cloud_name: process.env.CLOUNDINARY_NAME,
  api_key: process.env.CLOUNDINARY_API_KEY,
  api_secret: process.env.CLOUNDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFileUrl) => {
  try {
    if (!localFileUrl) return null;
    const response = await cloudinary.uploader.upload(localFileUrl, {
      resource_type: "auto",
    });
    fs.unlinkSync(localFileUrl);
    return response;
  } catch (error) {
    if (fs.existsSync(localFileUrl)) {
      fs.unlinkSync(localFileUrl);
    }
    return null;
  }
};

const removeFromCloudinary = async (publicId, resourceType) => {
  try {
    if (!publicId) return null;
    const response = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return response
  } catch (error) {
    console.log(error.message)
    return null
  }
};

export { uploadOnCloudinary,removeFromCloudinary };
