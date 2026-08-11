import { Router } from "express";
import { healthcheck } from "../controllers/healthcheck.controllers.js";



router.route("/").get(healthcheck);


 

const router = Router();

export default router;