import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { getLikedVideosCount, toggleCommentLike, toggleTweetLike, toggleVideoLike,getLikedTweetCount,getLikedCommentsCount } from "../controllers/like.controller.js";

const router=Router();

router.use(verifyJwt)
router.route("/videoLike/:videoId").post(toggleVideoLike)
router.route("/commentLike/:commentId").post(toggleCommentLike)
router.route("/tweetLike/:tweetId").post(toggleTweetLike)


router.route("/likeVideoCount/:videoId").post(getLikedVideosCount)
router.route("/likeTweetCount/:tweetId").post(getLikedTweetCount)
router.route("/likeCommmentCount/:commentId").post(getLikedCommentsCount)

export default router