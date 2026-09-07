import { Router } from "express";
import {forgetPasswordRequest, logoutUser, refreshToken, registerUser, resetForgotPassword, verifyEmail} from "../controllers/auth.controllers.js"
import { validate } from "../middleware/validator.middleware.js";
import { userRegisterValidator,userLoginValidator, userResetForgotPasswordValidator } from "../validators/index.js";
import { login } from "../controllers/auth.controllers.js";
import {  verifyJWT } from "../middleware/auth.middleware.js"

const router = Router();

//unsecured route
router.route("/register").post( userRegisterValidator(), validate, registerUser)

router.route("/login").post(userLoginValidator(),validate, login);

router.route("/verify-email/:verificationToken").get( verifyEmail);

router.route("/refresh-token").post(refreshToken); //////////////////////////////////////////////////////////////

router.route("/forget-password").post(userForgotPasswordValidator(), validate, forgetPasswordRequest)

router.route("/reset-password/:resetToken" )
.post(userResetForgotPasswordValidator(), validate, resetForgotPassword)


 

// secure route
router.route("/logout").post(verifyJWT, logoutUser);



export default router;