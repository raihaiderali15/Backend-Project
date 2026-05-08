import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {createTweet,updateTweet,deleteTweet,getUserTweets} from "../controllers/tweet.controller.js"
const router=Router()
router.use(verifyJwt);
router.route("/tweet").post(createTweet)
router.route("/uptade/:tweetId").patch(updateTweet)
router.route("/delete/:tweetId").delete(deleteTweet)
router.route("/getTweets/:userId").get(getUserTweets)


export default router