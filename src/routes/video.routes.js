import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { publishVideo } from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
const router=Router()
router.route("/publish").post(verifyJwt,upload.fields([
    {name:"video",
     maxCount:1
    },
    {name:"thumbnail",
        maxCount:1
    }
]),publishVideo)

export default router