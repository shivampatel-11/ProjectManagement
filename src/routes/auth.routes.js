import { Router } from "express";
import {registerUser} from "../controllers/auth.controllers.js"
import { validate } from "../middleware/validator.middleware.js";
import { userRegisterValidator,userLoginValidator } from "../validators/index.js";
import { login } from "../controllers/auth.controllers.js";


const router = Router();


router.route("/register").post( userRegisterValidator(), validate, registerUser)
router.route("/login").post(userLoginValidator(),validate, login);


export default router;