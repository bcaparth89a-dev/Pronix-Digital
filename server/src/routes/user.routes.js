import { Router } from "express";
import {
  deleteUser,
  getUserById,
  listUsers,
  updateUser,
} from "../controllers/user.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { validate } from "../middlewares/validate.js";
import {
  listUsersSchema,
  updateUserSchema,
  userIdSchema,
} from "../validators/user.validator.js";

export const userRouter = Router();

userRouter.get("/", authenticate, authorize("admin"), validate(listUsersSchema), listUsers);
userRouter.get("/:id", authenticate, authorize("admin"), validate(userIdSchema), getUserById);
userRouter.patch("/:id", authenticate, authorize("admin"), validate(updateUserSchema), updateUser);
userRouter.delete("/:id", authenticate, authorize("admin"), validate(userIdSchema), deleteUser);
