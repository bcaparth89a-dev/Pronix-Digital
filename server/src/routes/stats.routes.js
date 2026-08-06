import { Router } from "express";
import { getDashboardStats } from "../controllers/stats.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";

export const statsRouter = Router();

statsRouter.get("/", authenticate, authorize("admin"), getDashboardStats);
