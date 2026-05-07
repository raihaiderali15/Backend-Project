import { Router } from "express";
const router = Router();
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { addComment ,updateComment,deleteComment ,getAllComments} from "../controllers/comment.controller.js";

router.use(verifyJwt);
router.route("/:videoId").post(addComment);
router.route("/update/:commentId").put(updateComment);
router.route("/delete/:commentId").delete(deleteComment);
router.route("/getcomments/:videoId").get(getAllComments);
export default router