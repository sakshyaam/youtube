import { Router } from "express";
import { loginUser, logoutUser, refreshAccessToken, registerUser } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// How to use that upload
//middle

//register route ma kunai request airaxa, registerUser execute hunxa
// tara bich ma middleware


router.route("/register").post(
    upload.fields([ 
        {
            name : "avatar",
            maxCount : 1
        },
        {
            name : "coverImage",
            maxCount : 1
        }
    ]),
    registerUser)

//secured routes
//verifyJWT is the middleware -> gets the user
router.route("/logout").post(verifyJWT,logoutUser)


router.route("/login").post(
    loginUser
)

router.route("/refresh-token").post(refreshAccessToken)








export default router;