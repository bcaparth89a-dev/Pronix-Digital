import { Router } from "express";
import { chatMessage } from "../controllers/chat.controller.js";
import { chatLimiter } from "../config/rateLimiter.js";

export const chatRouter = Router();

chatRouter.post("/", chatLimiter, chatMessage);

