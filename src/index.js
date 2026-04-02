// import mongoose from "mongoose";
// import express from "express";
// import { DB_NAME } from "./constants.js";
// import dotenv from "dotenv";
// dotenv.config({path:"./.env"});
// const app = express();

// app.get("/", (req, res) => {
//   res.send("Server is started");
// });

// app.on("error", (error) => {
//   console.log("Err", error);
// });

// (async () => {
//   try {
//     await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);

//     app.listen(process.env.PORT, () => {
//       console.log(`Server is listening at ${process.env.PORT}`);
//     });
//   } catch (error) {
//     console.error("Error", error);
//     process.exit(1);
//   }
// })();



import dotenv from "dotenv"
import ConnectDB from "./db/index.js"


ConnectDB()