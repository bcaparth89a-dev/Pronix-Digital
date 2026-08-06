import { Router } from "express";
import {
  getCurrentAdmin,
  loginAdmin,
  logoutAdmin,
  refreshAdminSession,
} from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { validate } from "../middlewares/validate.js";
import { adminLoginSchema } from "../validators/auth.validator.js";
import { authLimiter } from "../config/rateLimiter.js";

export const authRouter = Router();

authRouter.post("/admin/login", authLimiter, validate(adminLoginSchema), loginAdmin);
authRouter.post("/admin/refresh", refreshAdminSession);
authRouter.post("/admin/logout", logoutAdmin);
authRouter.get("/admin/me", authenticate, authorize("admin"), getCurrentAdmin);

