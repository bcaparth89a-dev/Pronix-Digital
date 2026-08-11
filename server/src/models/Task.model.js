import mongoose from "mongoose";

const taskHistorySchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
    },
    details: {
      type: String,
    },
    performedBy: {
      type: String,
      default: "System",
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 250,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    date: {
      type: String, // format YYYY-MM-DD
      required: true,
      index: true,
    },
    startTime: {
      type: String, // e.g., "08:40 PM"
      trim: true,
    },
    endTime: {
      type: String, // e.g., "09:05 PM"
      trim: true,
    },
    assignedTo: {
      type: String,
      enum: ["Parth", "Ronit", "Both", "Unassigned"],
      default: "Unassigned",
      index: true,
    },
    category: {
      type: String,
      trim: true,
      default: "Other",
      index: true,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Urgent"],
      default: "Medium",
      index: true,
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed", "Cancelled", "Overdue"],
      default: "Pending",
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    source: {
      type: String,
      enum: ["ai", "manual", "seed"],
      default: "manual",
      index: true,
    },
    originalPrompt: {
      type: String,
      trim: true,
    },
    generatedAt: {
      type: Date,
    },
    createdBy: {
      type: String, // name or ID of the admin who created the task
      trim: true,
    },
    completedBy: {
      type: String, // name/email of who marked it completed
      trim: true,
    },
    completedAt: {
      type: Date,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedBy: {
      type: String,
      trim: true,
    },
    deletedAt: {
      type: Date,
    },
    history: [taskHistorySchema],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes for fast lookups
taskSchema.index({ date: 1, isDeleted: 1 });
taskSchema.index({ assignedTo: 1, date: 1, isDeleted: 1 });
taskSchema.index({ status: 1, date: 1, isDeleted: 1 });

taskSchema.index({
  title: "text",
  description: "text",
  notes: "text",
  category: "text",
});

export const Task = mongoose.model("Task", taskSchema);
