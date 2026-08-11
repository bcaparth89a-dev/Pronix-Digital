import { httpStatus } from "../constants/httpStatus.js";
import { taskRepository } from "../repositories/task.repository.js";
import { parseTasksWithAi } from "../services/taskAi.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Task } from "../models/Task.model.js";

// Helper to parse hh:mm AM/PM into hours and minutes
function parseTime(timeStr) {
  if (!timeStr) return null;
  const match = timeStr.trim().match(/^(\d+):(\d+)\s*(AM|PM)$/i);
  if (!match) return null;
  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const ampm = match[3].toUpperCase();
  if (ampm === "PM" && hours < 12) hours += 12;
  if (ampm === "AM" && hours === 12) hours = 0;
  return { hours, minutes };
}

// Sweep overdue tasks on-demand
async function sweepOverdueTasks() {
  const now = new Date();
  
  // Format current date as YYYY-MM-DD in India time (local time of the user)
  // The local time is 2026-08-10. Let's align with that.
  // We can construct today's local date string
  const offset = 5.5 * 60 * 60 * 1000; // India offset
  const localNow = new Date(now.getTime() + offset);
  const todayStr = localNow.toISOString().split("T")[0];

  const pendingTasks = await Task.find({
    isDeleted: false,
    status: { $in: ["Pending", "In Progress"] },
  });

  for (const task of pendingTasks) {
    let isOverdue = false;
    
    if (task.date < todayStr) {
      isOverdue = true;
    } else if (task.date === todayStr && task.endTime) {
      const parsed = parseTime(task.endTime);
      if (parsed) {
        const [year, month, day] = task.date.split("-").map(Number);
        const endTimeObj = new Date(year, month - 1, day, parsed.hours, parsed.minutes, 0);
        // Compare end time in UTC
        // Since we got the local time, we can create the local end time object
        const localEndTime = new Date(endTimeObj.getTime() + offset);
        if (localNow > localEndTime) {
          isOverdue = true;
        }
      }
    }

    if (isOverdue) {
      const oldStatus = task.status;
      task.status = "Overdue";
      task.history.push({
        action: "Status changed",
        details: `${oldStatus} → Overdue`,
        performedBy: "System",
        timestamp: new Date(),
      });
      await task.save();
    }
  }
}

export const listTasks = asyncHandler(async (req, res) => {
  await sweepOverdueTasks();
  const result = await taskRepository.list(req.validated.query);
  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, result, "Tasks fetched successfully"));
});

export const getTaskById = asyncHandler(async (req, res) => {
  await sweepOverdueTasks();
  const task = await taskRepository.findById(req.validated.params.id);
  if (!task || task.isDeleted) {
    res.status(httpStatus.NOT_FOUND).json(new ApiResponse(httpStatus.NOT_FOUND, null, "Task not found"));
    return;
  }
  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, task, "Task fetched successfully"));
});

export const createTask = asyncHandler(async (req, res) => {
  const payload = {
    ...req.validated.body,
    source: req.validated.body.source || "manual",
    createdBy: req.user?.name || req.user?.email || "Admin",
    history: [
      {
        action: "Task created",
        details: `Created via ${req.validated.body.source || "manual"}`,
        performedBy: req.user?.name || req.user?.email || "Admin",
        timestamp: new Date(),
      },
    ],
  };

  const task = await taskRepository.create(payload);
  res.status(httpStatus.CREATED).json(new ApiResponse(httpStatus.CREATED, task, "Task created successfully"));
});

export const updateTask = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;
  const updates = req.validated.body;

  const existingTask = await Task.findById(id);
  if (!existingTask || existingTask.isDeleted) {
    res.status(httpStatus.NOT_FOUND).json(new ApiResponse(httpStatus.NOT_FOUND, null, "Task not found"));
    return;
  }

  const actor = req.user?.name || req.user?.email || "Admin";
  const historyEntries = [];

  // Track status changes
  if (updates.status && updates.status !== existingTask.status) {
    historyEntries.push({
      action: "Status changed",
      details: `${existingTask.status} → ${updates.status}`,
      performedBy: actor,
      timestamp: new Date(),
    });

    if (updates.status === "Completed") {
      updates.completedAt = new Date();
      updates.completedBy = actor;
      historyEntries.push({
        action: "Task completed",
        details: `Completed by ${actor}`,
        performedBy: actor,
        timestamp: new Date(),
      });
    } else if (existingTask.status === "Completed") {
      // Reopening completed task
      updates.completedAt = null;
      updates.completedBy = null;
      historyEntries.push({
        action: "Task reopened",
        details: `Reopened by ${actor}`,
        performedBy: actor,
        timestamp: new Date(),
      });
    }
  }

  // Track assignment changes
  if (updates.assignedTo && updates.assignedTo !== existingTask.assignedTo) {
    historyEntries.push({
      action: "Task assigned",
      details: `Assigned to ${updates.assignedTo}`,
      performedBy: actor,
      timestamp: new Date(),
    });
  }

  // Other edits
  const genericEdits = [];
  for (const key of Object.keys(updates)) {
    if (key !== "status" && key !== "assignedTo" && key !== "history" && updates[key] !== existingTask[key]) {
      genericEdits.push(key);
    }
  }

  if (genericEdits.length > 0) {
    historyEntries.push({
      action: "Task edited",
      details: `Modified fields: ${genericEdits.join(", ")}`,
      performedBy: actor,
      timestamp: new Date(),
    });
  }

  // Update in database
  const updatedTask = await Task.findByIdAndUpdate(
    id,
    {
      $set: updates,
      $push: { history: { $each: historyEntries } },
    },
    { new: true }
  ).lean();

  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, updatedTask, "Task updated successfully"));
});

export const deleteTask = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;
  const task = await Task.findById(id);
  if (!task || task.isDeleted) {
    res.status(httpStatus.NOT_FOUND).json(new ApiResponse(httpStatus.NOT_FOUND, null, "Task not found"));
    return;
  }

  const actor = req.user?.name || req.user?.email || "Admin";

  task.isDeleted = true;
  task.deletedBy = actor;
  task.deletedAt = new Date();
  task.history.push({
    action: "Task deleted",
    details: "Soft-deleted from dashboard",
    performedBy: actor,
    timestamp: new Date(),
  });
  await task.save();

  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, null, "Task deleted successfully"));
});

export const restoreTask = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;
  const task = await Task.findById(id);
  if (!task || !task.isDeleted) {
    res.status(httpStatus.NOT_FOUND).json(new ApiResponse(httpStatus.NOT_FOUND, null, "Task not found or not deleted"));
    return;
  }

  const actor = req.user?.name || req.user?.email || "Admin";

  task.isDeleted = false;
  task.deletedBy = null;
  task.deletedAt = null;
  task.history.push({
    action: "Task restored",
    details: `Task restored by ${actor}`,
    performedBy: actor,
    timestamp: new Date()
  });
  await task.save();

  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, task, "Task restored successfully"));
});

export const permanentDeleteTask = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;
  const task = await Task.findById(id);
  if (!task) {
    res.status(httpStatus.NOT_FOUND).json(new ApiResponse(httpStatus.NOT_FOUND, null, "Task not found"));
    return;
  }

  await Task.findByIdAndDelete(id);
  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, null, "Task permanently deleted"));
});

export const bulkDeleteTasks = asyncHandler(async (req, res) => {
  const { ids } = req.validated.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    res.status(httpStatus.BAD_REQUEST).json(new ApiResponse(httpStatus.BAD_REQUEST, null, "Task IDs are required"));
    return;
  }

  const actor = req.user?.name || req.user?.email || "Admin";

  await Task.updateMany(
    { _id: { $in: ids }, isDeleted: false },
    {
      $set: {
        isDeleted: true,
        deletedBy: actor,
        deletedAt: new Date()
      },
      $push: {
        history: {
          action: "Task deleted",
          details: "Bulk soft-deleted",
          performedBy: actor,
          timestamp: new Date()
        }
      }
    }
  );

  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, null, "Tasks bulk soft-deleted successfully"));
});

export const deleteAllTasks = asyncHandler(async (req, res) => {
  const { confirmationText } = req.body;
  if (confirmationText !== "DELETE ALL") {
    res.status(httpStatus.BAD_REQUEST).json(new ApiResponse(httpStatus.BAD_REQUEST, null, "Invalid confirmation text"));
    return;
  }

  const totalTasksCount = await Task.countDocuments({});

  // Permanently delete all tasks in the collection
  await Task.deleteMany({});

  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, { modifiedCount: totalTasksCount }, "All tasks deleted successfully"));
});

export const deleteFilteredTasks = asyncHandler(async (req, res) => {
  const { filters } = req.validated.body;
  const actor = req.user?.name || req.user?.email || "Admin";

  // Use repo to fetch matching active task IDs
  const listResult = await taskRepository.list({ ...filters, limit: 10000 });
  const ids = listResult.items.map(t => t._id);

  if (ids.length === 0) {
    res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, { modifiedCount: 0 }, "No matching tasks found to delete"));
    return;
  }

  const result = await Task.updateMany(
    { _id: { $in: ids }, isDeleted: false },
    {
      $set: {
        isDeleted: true,
        deletedBy: actor,
        deletedAt: new Date()
      },
      $push: {
        history: {
          action: "Task deleted",
          details: "Soft-deleted via Delete Filtered Tasks action",
          performedBy: actor,
          timestamp: new Date()
        }
      }
    }
  );

  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, { modifiedCount: result.modifiedCount }, "Filtered tasks deleted successfully"));
});

export const analyzeTasksWithAi = asyncHandler(async (req, res) => {
  const { paragraph } = req.validated.body;
  const result = await parseTasksWithAi(paragraph);
  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, result, "Plan parsed successfully"));
});

export const bulkUpdateTasks = asyncHandler(async (req, res) => {
  const { ids, action, payload } = req.validated.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    res.status(httpStatus.BAD_REQUEST).json(new ApiResponse(httpStatus.BAD_REQUEST, null, "Task IDs are required"));
    return;
  }

  const actor = req.user?.name || req.user?.email || "Admin";
  const historyEntry = {
    action: `Bulk operation: ${action}`,
    performedBy: actor,
    timestamp: new Date(),
  };

  if (action === "delete") {
    await Task.updateMany(
      { _id: { $in: ids } },
      {
        $set: { isDeleted: true },
        $push: { history: { action: "Task deleted", details: "Bulk soft-deleted", performedBy: actor, timestamp: new Date() } },
      }
    );
  } else if (action === "status") {
    const status = payload.status;
    const completedAt = status === "Completed" ? new Date() : null;
    const completedBy = status === "Completed" ? actor : null;

    const tasks = await Task.find({ _id: { $in: ids } });
    for (const task of tasks) {
      const entries = [
        {
          action: "Status changed",
          details: `Bulk: ${task.status} → ${status}`,
          performedBy: actor,
          timestamp: new Date(),
        },
      ];
      if (status === "Completed") {
        entries.push({
          action: "Task completed",
          details: `Bulk completed by ${actor}`,
          performedBy: actor,
          timestamp: new Date(),
        });
      } else if (task.status === "Completed") {
        entries.push({
          action: "Task reopened",
          details: `Bulk reopened by ${actor}`,
          performedBy: actor,
          timestamp: new Date(),
        });
      }

      await Task.findByIdAndUpdate(task._id, {
        $set: { status, completedAt, completedBy },
        $push: { history: { $each: entries } },
      });
    }
  } else if (action === "assign") {
    const assignedTo = payload.assignedTo;
    await Task.updateMany(
      { _id: { $in: ids } },
      {
        $set: { assignedTo },
        $push: { history: { action: "Task assigned", details: `Bulk assigned to ${assignedTo}`, performedBy: actor, timestamp: new Date() } },
      }
    );
  } else if (action === "priority") {
    const priority = payload.priority;
    await Task.updateMany(
      { _id: { $in: ids } },
      {
        $set: { priority },
        $push: { history: { action: "Task edited", details: `Bulk priority → ${priority}`, performedBy: actor, timestamp: new Date() } },
      }
    );
  }

  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, null, "Bulk operation completed successfully"));
});

export const getDashboardStats = asyncHandler(async (req, res) => {
  await sweepOverdueTasks();

  const now = new Date();
  const offset = 5.5 * 60 * 60 * 1000;
  const localNow = new Date(now.getTime() + offset);
  const todayStr = localNow.toISOString().split("T")[0];

  // Fetch all tasks for today
  const todayTasks = await Task.find({
    isDeleted: false,
    date: todayStr,
  }).lean();

  // Parth's tasks today
  const parthTasks = todayTasks.filter((t) => t.assignedTo === "Parth" || t.assignedTo === "Both");
  const parthCompleted = parthTasks.filter((t) => t.status === "Completed").length;
  const parthTotal = parthTasks.length;

  // Ronit's tasks today
  const ronitTasks = todayTasks.filter((t) => t.assignedTo === "Ronit" || t.assignedTo === "Both");
  const ronitCompleted = ronitTasks.filter((t) => t.status === "Completed").length;
  const ronitTotal = ronitTasks.length;

  // Overall today
  const overallCompleted = todayTasks.filter((t) => t.status === "Completed").length;
  const overallTotal = todayTasks.length;
  const progressPercent = overallTotal > 0 ? Math.round((overallCompleted / overallTotal) * 100) : 0;

  // Global active counts (dashboard cards counts)
  const totalActive = await Task.countDocuments({ isDeleted: false });
  const totalDeleted = await Task.countDocuments({ isDeleted: true });

  const activeCompleted = await Task.countDocuments({ isDeleted: false, status: "Completed" });
  const activePending = await Task.countDocuments({ isDeleted: false, status: "Pending" });
  const activeInProgress = await Task.countDocuments({ isDeleted: false, status: "In Progress" });
  const activeOverdue = await Task.countDocuments({ isDeleted: false, status: "Overdue" });

  res.status(httpStatus.OK).json(
    new ApiResponse(
      httpStatus.OK,
      {
        date: todayStr,
        stats: {
          completed: activeCompleted,
          pending: activePending,
          inProgress: activeInProgress,
          overdue: activeOverdue,
          totalActive,
          totalDeleted,
          today: overallTotal,
        },
        parth: {
          completed: parthCompleted,
          total: parthTotal,
        },
        ronit: {
          completed: ronitCompleted,
          total: ronitTotal,
        },
        overall: {
          completed: overallCompleted,
          total: overallTotal,
          progress: progressPercent,
        },
      },
      "Stats fetched successfully"
    )
  );
});
