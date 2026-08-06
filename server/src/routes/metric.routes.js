import { Router } from "express";
import {
  createMetric,
  deleteMetric,
  getMetricById,
  listMetrics,
  updateMetric,
} from "../controllers/metric.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { optionalAuthenticate } from "../middlewares/optionalAuthenticate.js";
import { validate } from "../middlewares/validate.js";
import {
  createMetricSchema,
  metricIdSchema,
  listMetricsSchema,
  updateMetricSchema,
} from "../validators/metric.validator.js";

export const metricRouter = Router();

metricRouter.get("/", optionalAuthenticate, validate(listMetricsSchema), listMetrics);
metricRouter.get("/:id", optionalAuthenticate, validate(metricIdSchema), getMetricById);
metricRouter.post("/", authenticate, authorize("admin"), validate(createMetricSchema), createMetric);
metricRouter.patch("/:id", authenticate, authorize("admin"), validate(updateMetricSchema), updateMetric);
metricRouter.delete("/:id", authenticate, authorize("admin"), validate(metricIdSchema), deleteMetric);
