import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
const verifyJwt= async(req,res,next)=>{

try {
    const token = req?.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");
    if(!token){
        throw new ApiError(401,"Unauthorized Request")
    }
    
    const decoded=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    
    if(!decoded){
        throw new ApiError(401,"Invalid access token")
    }
    const user=await User.findById(decoded._id).select("-password -refreshToken")
    if(!user){
        throw new ApiError(404,"User no longer exsist")
    }
    req.user=user;
    
    next();
} catch (error) {
    next(error)
}
}

export {verifyJwt}
