import { Task } from "../models/Task.model.js";
import { BaseRepository } from "./base.repository.js";
import { buildSearchFilter } from "../utils/queryOptions.js";

class TaskRepository extends BaseRepository {
  constructor() {
    super(Task);
  }

  list(query) {
    const showDeleted = query.status === "Deleted" || query.isDeleted === "true" || query.isDeleted === true;
    const filter = {
      isDeleted: showDeleted,
      ...buildSearchFilter(query.search, ["title", "description", "notes", "category"]),
    };

    // Filter by assignedTo person
    if (query.assignedTo && query.assignedTo !== "All") {
      if (query.assignedTo === "Parth") {
        filter.assignedTo = { $in: ["Parth", "Both"] };
      } else if (query.assignedTo === "Ronit") {
        filter.assignedTo = { $in: ["Ronit", "Both"] };
      } else {
        filter.assignedTo = query.assignedTo;
      }
    }

    // Filter by exact date or date range
    if (query.date) {
      filter.date = query.date;
    } else if (query.startDate || query.endDate) {
      filter.date = {};
      if (query.startDate) filter.date.$gte = query.startDate;
      if (query.endDate) filter.date.$lte = query.endDate;
    }

    // Filters for category, priority, status
    if (query.category) filter.category = query.category;
    if (query.priority) filter.priority = query.priority;
    if (query.status && query.status !== "Deleted") {
      // Overdue is determined dynamically or stored, let's filter by stored status first
      filter.status = query.status;
    }

    return this.paginate({
      filter,
      query,
      sortFields: ["title", "date", "startTime", "endTime", "assignedTo", "category", "priority", "status", "createdAt"],
      defaultSort: "date startTime createdAt",
    });
  }

  async findDuplicates(tasks) {
    const duplicates = [];
    for (const t of tasks) {
      if (!t.date || !t.title) continue;
      
      const existing = await this.findOne({
        isDeleted: false,
        date: t.date,
        assignedTo: t.assignedTo || "Unassigned",
        startTime: t.startTime || null,
        title: { $regex: new RegExp(`^${t.title.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, "i") },
      });

      if (existing) {
        duplicates.push(existing);
      }
    }
    return duplicates;
  }
}

export const taskRepository = new TaskRepository();
