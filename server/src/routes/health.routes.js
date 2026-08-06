import { Router } from "express";
import { getApiHealth } from "../controllers/health.controller.js";

export const healthRouter = Router();

healthRouter.get("/", getApiHealth);
