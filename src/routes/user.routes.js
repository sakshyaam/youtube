import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"

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










export default router;