import { Router } from "express";
import {changeCurrentPassword, forgetPasswordRequest, getCurrentUser, logoutUser, refreshToken, registerUser, resendEmailVerification, resetForgotPassword, verifyEmail} from "../controllers/auth.controllers.js"
import { validate } from "../middleware/validator.middleware.js";
import { userRegisterValidator,userLoginValidator, userResetForgotPasswordValidator, userChangeCurrentPasswordValidator, userForgotPasswordValidator } from "../validators/index.js";
import { login } from "../controllers/auth.controllers.js";
import {  verifyJWT } from "../middleware/auth.middleware.js";



const router = Router();

//unsecured route
router.route("/register").post( userRegisterValidator(), validate, registerUser)
router.route("/login").post(userLoginValidator(),validate, login);
router.route("/verify-email/:verificationToken").get( verifyEmail);
router.route("/refresh-token").post(refreshToken); ///
router.route("/forget-password").post( userForgotPasswordValidator(), validate, forgetPasswordRequest)
router.route("/reset-password/:resetToken" )
.post(userResetForgotPasswordValidator(), validate, resetForgotPassword)


 

// secure route
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/current-user").post(verifyJWT, getCurrentUser);
router.route("/change-password").post(verifyJWT,userChangeCurrentPasswordValidator(), validate, changeCurrentPassword);
router.route("/reset-email-verification").post(verifyJWT, resendEmailVerification);


export default router;