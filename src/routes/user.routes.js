import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { loginUser , registerUser,logoutUser, refreshAccessToken,uptadePassword} from "../controllers/user.controller.js";
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

export default router;
