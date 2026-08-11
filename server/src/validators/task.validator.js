import { z } from "zod";
import { mongoIdSchema } from "./common.validator.js";
import { paginationQuerySchema } from "./query.validator.js";

const taskPayloadSchema = z.object({
  title: z.string().trim().min(2).max(250),
  description: z.string().trim().optional().default(""),
  date: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format. Expected YYYY-MM-DD"),
  startTime: z.string().trim().optional().nullable(),
  endTime: z.string().trim().optional().nullable(),
  assignedTo: z.enum(["Parth", "Ronit", "Both", "Unassigned"]).optional().default("Unassigned"),
  category: z.string().trim().optional().default("Other"),
  priority: z.enum(["Low", "Medium", "High", "Urgent"]).optional().default("Medium"),
  status: z.enum(["Pending", "In Progress", "Completed", "Cancelled", "Overdue"]).optional().default("Pending"),
  notes: z.string().trim().optional().default(""),
  source: z.enum(["ai", "manual", "seed"]).optional().default("manual"),
  originalPrompt: z.string().trim().optional(),
  generatedAt: z.coerce.date().optional(),
});

export const createTaskSchema = z.object({
  body: taskPayloadSchema,
});

export const updateTaskSchema = z.object({
  params: z.object({
    id: mongoIdSchema,
  }),
  body: taskPayloadSchema.partial().refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required to update",
  }),
});

export const taskIdSchema = z.object({
  params: z.object({
    id: mongoIdSchema,
  }),
});

export const listTasksSchema = z.object({
  query: paginationQuerySchema.extend({
    assignedTo: z.enum(["All", "Parth", "Ronit", "Both", "Unassigned"]).optional(),
    date: z.string().trim().optional(),
    startDate: z.string().trim().optional(),
    endDate: z.string().trim().optional(),
    category: z.string().trim().optional(),
    priority: z.enum(["Low", "Medium", "High", "Urgent"]).optional(),
    status: z.enum(["Pending", "In Progress", "Completed", "Cancelled", "Overdue", "Deleted"]).optional(),
  }),
});

export const analyzeAiSchema = z.object({
  body: z.object({
    paragraph: z.string().trim().min(5, "Paragraph must be at least 5 characters long"),
  }),
});

export const bulkUpdateSchema = z.object({
  body: z.object({
    ids: z.array(mongoIdSchema).min(1, "At least one Task ID is required"),
    action: z.enum(["delete", "status", "assign", "priority"]),
    payload: z.object({
      status: z.enum(["Pending", "In Progress", "Completed", "Cancelled", "Overdue"]).optional(),
      assignedTo: z.enum(["Parth", "Ronit", "Both", "Unassigned"]).optional(),
      priority: z.enum(["Low", "Medium", "High", "Urgent"]).optional(),
    }).optional(),
  }),
});

export const bulkDeleteSchema = z.object({
  body: z.object({
    ids: z.array(mongoIdSchema).min(1, "At least one Task ID is required"),
  }),
});

export const deleteFilteredSchema = z.object({
  body: z.object({
    filters: z.object({
      search: z.string().optional(),
      assignedTo: z.enum(["All", "Parth", "Ronit", "Both", "Unassigned"]).optional(),
      date: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      category: z.string().optional(),
      priority: z.enum(["Low", "Medium", "High", "Urgent"]).optional(),
      status: z.enum(["Pending", "In Progress", "Completed", "Cancelled", "Overdue"]).optional(),
    }),
  }),
});
