import { Router } from "express";
import {logoutUser, registerUser} from "../controllers/auth.controllers.js"
import { validate } from "../middleware/validator.middleware.js";
import { userRegisterValidator,userLoginValidator } from "../validators/index.js";
import { login } from "../controllers/auth.controllers.js";
import {  verifyJWT } from "../middleware/auth.middleware.js"

const router = Router();


router.route("/register").post( userRegisterValidator(), validate, registerUser)
router.route("/login").post(userLoginValidator(),validate, login);


// secure route
router.route("/logout").post(verifyJWT, logoutUser);



export default router;