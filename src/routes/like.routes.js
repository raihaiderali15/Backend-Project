import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { toggleCommentLike, toggleVideoLike } from "../controllers/like.controller.js";

const router=Router();

router.use(verifyJwt)
router.route("/videoLike/:videoId").post(toggleVideoLike)
router.route("/commentLike/:commentId").post(toggleCommentLike)


export default router