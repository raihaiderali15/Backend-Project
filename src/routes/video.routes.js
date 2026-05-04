import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { deletVido, getVideoById, publishVideo, uptadeVideo } from "../controllers/video.controller.js";
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
router.route("/:id").get(getVideoById)
router.route("/uptade/:id").patch(verifyJwt,upload.single("thumbnail"),uptadeVideo)
router.route("/delete/:id").delete(verifyJwt,deletVido)


export default router