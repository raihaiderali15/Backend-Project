import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { loginUser , registerUser,logoutUser, refreshAccessToken,uptadePassword, uptadeAccountDetail, uptadeAvatar, uptadeCoverImage, getUserChannelProfile, subscribeToChannel} from "../controllers/user.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);
router.route("/login").post(loginUser)


router.route("/logout").post(verifyJwt,logoutUser)
router.route("/refreshtoken").post(refreshAccessToken)
router.route("/uptadepassword").post(verifyJwt,uptadePassword)
router.route("/uptadeaccount").post(verifyJwt,uptadeAccountDetail)
router.route("/uptadeavatar").post(upload.single("avatar"),verifyJwt,uptadeAvatar)
router.route("/uptadecoverimage").post(upload.single("coverimage"),verifyJwt,uptadeCoverImage)
router.route("/:username").get(verifyJwt,getUserChannelProfile)

router.route("/subscribe/:channelId").post(verifyJwt,subscribeToChannel)
export default router;
