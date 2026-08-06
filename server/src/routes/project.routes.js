import { Router } from "express";
import {
  createProject,
  deleteProject,
  getProjectById,
  getProjectBySlug,
  listProjects,
  updateProject,
  reorderProjects,
} from "../controllers/project.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { optionalAuthenticate } from "../middlewares/optionalAuthenticate.js";
import { validate } from "../middlewares/validate.js";
import {
  createProjectSchema,
  listProjectsSchema,
  projectIdSchema,
  projectSlugSchema,
  updateProjectSchema,
  reorderSchema,
} from "../validators/project.validator.js";
import { cacheMiddleware, clearCacheMiddleware } from "../middlewares/cache.middleware.js";

export const projectRouter = Router();

projectRouter.get("/", optionalAuthenticate, validate(listProjectsSchema), cacheMiddleware(300, "projects"), listProjects);
projectRouter.get(
  "/by-id/:id",
  authenticate,
  authorize("admin"),
  validate(projectIdSchema),
  getProjectById,
);
projectRouter.patch(
  "/reorder",
  authenticate,
  authorize("admin"),
  validate(reorderSchema),
  clearCacheMiddleware("projects"),
  reorderProjects,
);
projectRouter.get("/:slug", optionalAuthenticate, validate(projectSlugSchema), cacheMiddleware(300, "projects"), getProjectBySlug);
projectRouter.post(
  "/",
  authenticate,
  authorize("admin"),
  validate(createProjectSchema),
  clearCacheMiddleware("projects"),
  createProject,
);
projectRouter.patch(
  "/:id",
  authenticate,
  authorize("admin"),
  validate(updateProjectSchema),
  clearCacheMiddleware("projects"),
  updateProject,
);
projectRouter.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  validate(projectIdSchema),
  clearCacheMiddleware("projects"),
  deleteProject,
);
