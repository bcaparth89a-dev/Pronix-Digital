import { Router } from "express";
import {
  listTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  analyzeTasksWithAi,
  bulkUpdateTasks,
  getDashboardStats,
  restoreTask,
  permanentDeleteTask,
  bulkDeleteTasks,
  deleteAllTasks,
  deleteFilteredTasks
} from "../controllers/task.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { validate } from "../middlewares/validate.js";
import {
  createTaskSchema,
  updateTaskSchema,
  taskIdSchema,
  listTasksSchema,
  analyzeAiSchema,
  bulkUpdateSchema,
  bulkDeleteSchema,
  deleteFilteredSchema
} from "../validators/task.validator.js";

export const taskRouter = Router();

// Protect all task endpoints for admin use
taskRouter.use(authenticate, authorize("admin"));

taskRouter.get("/", validate(listTasksSchema), listTasks);
taskRouter.get("/stats", getDashboardStats);
taskRouter.post("/ai-analyze", validate(analyzeAiSchema), analyzeTasksWithAi);
taskRouter.post("/bulk-update", validate(bulkUpdateSchema), bulkUpdateTasks);

// Bulk and filtered deletions
taskRouter.post("/bulk-delete", validate(bulkDeleteSchema), bulkDeleteTasks);
taskRouter.post("/delete-all", deleteAllTasks);
taskRouter.post("/delete-filtered", validate(deleteFilteredSchema), deleteFilteredTasks);

// Individual task modifiers
taskRouter.get("/:id", validate(taskIdSchema), getTaskById);
taskRouter.post("/", validate(createTaskSchema), createTask);
taskRouter.patch("/:id", validate(updateTaskSchema), updateTask);
taskRouter.delete("/:id", validate(taskIdSchema), deleteTask);
taskRouter.post("/:id/restore", validate(taskIdSchema), restoreTask);
taskRouter.delete("/:id/permanent", validate(taskIdSchema), permanentDeleteTask);
