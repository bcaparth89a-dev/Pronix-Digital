import { Router } from "express";
import {
  createService,
  deleteService,
  getServiceById,
  listServices,
  updateService,
} from "../controllers/service.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { optionalAuthenticate } from "../middlewares/optionalAuthenticate.js";
import { validate } from "../middlewares/validate.js";
import {
  createServiceSchema,
  serviceIdSchema,
  listServicesSchema,
  updateServiceSchema,
} from "../validators/service.validator.js";
import { cacheMiddleware, clearCacheMiddleware } from "../middlewares/cache.middleware.js";

export const serviceRouter = Router();

serviceRouter.get("/", optionalAuthenticate, validate(listServicesSchema), cacheMiddleware(300, "services"), listServices);
serviceRouter.get("/:id", optionalAuthenticate, validate(serviceIdSchema), getServiceById);
serviceRouter.post("/", authenticate, authorize("admin"), validate(createServiceSchema), clearCacheMiddleware("services"), createService);
serviceRouter.patch("/:id", authenticate, authorize("admin"), validate(updateServiceSchema), clearCacheMiddleware("services"), updateService);
serviceRouter.delete("/:id", authenticate, authorize("admin"), validate(serviceIdSchema), clearCacheMiddleware("services"), deleteService);
