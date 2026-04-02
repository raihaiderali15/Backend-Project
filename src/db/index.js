import mongoose from "mongoose"
import { DB_NAME } from "../constants.js";

export const ConnectDB=async ()=>{
    try {
        console.log(`data from env : ${process.env.MONGODB_URL}/${DB_NAME}`)
       const connectionInstance= await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
       console.log(`Mongoose connected !! DB Host: ${connectionInstance.connection.host}`)
    } catch (error) {
        console.log("Error",error)
        process.exit(1)
    }
}
export default ConnectDB