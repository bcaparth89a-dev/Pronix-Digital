import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Sparkles,
  Plus,
  Search,
  Calendar as CalendarIcon,
  List,
  Kanban as KanbanIcon,
  Clock,
  User,
  Folder,
  AlertTriangle,
  CheckCircle2,
  X,
  ChevronRight,
  Info,
  Edit2,
  Trash2,
  Check,
  CheckSquare,
  Square,
  UserCheck,
  TrendingUp,
  AlertCircle,
  Undo2,
  ChevronLeft,
  Settings,
  MoreVertical
} from "lucide-react";
import { apiClient } from "@/services/apiClient";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { useToast } from "@/providers/ToastProvider";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

const DEFAULT_CATEGORIES = [
  "Technical",
  "Non-Technical",
  "Content",
  "Social Media",
  "Marketing",
  "Business Development",
  "Lead Generation",
  "Client Outreach",
  "Design",
  "Development",
  "Testing",
  "Website",
  "AI",
  "Research",
  "Meeting",
  "Administration",
  "Other"
];

const PRIORITIES = ["Low", "Medium", "High", "Urgent"];
const STATUSES = ["Pending", "In Progress", "Completed", "Cancelled", "Overdue"];

export function WorkManagementPage() {
  const queryClient = useQueryClient();
  const toast = useToast();

  // Navigation views: 'dashboard', 'tasks', 'calendar', 'deleted'
  const [activeTab, setActiveTab] = useState("dashboard");
  
  // Custom quick-view sub-filters: 'all', 'today', 'my-tasks', 'completed', 'pending', 'overdue'
  const [quickView, setQuickView] = useState("all");
  const [taskBoardView, setTaskBoardView] = useState("list"); // 'list', 'kanban'

  // Calendar view navigation state
  const [calendarYear, setCalendarYear] = useState(2026);
  const [calendarMonth, setCalendarMonth] = useState(7); // 0-indexed, 7 = August

  // Filtering & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPerson, setFilterPerson] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  
  // Date filter: default is empty (All), or 'today', 'tomorrow', 'this-week', 'this-month', or 'YYYY-MM-DD'
  const [dateFilterType, setDateFilterType] = useState("All");
  const [customDateValue, setCustomDateValue] = useState("");

  // Modals & Drawers
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null); // for detail drawer
  const [editingTask, setEditingTask] = useState(null); // for manual edit mode

  // Custom Delete Confirm Dialogs
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [isDeleteFilteredOpen, setIsDeleteFilteredOpen] = useState(false);
  const [isDeleteAllOpen, setIsDeleteAllOpen] = useState(false);
  const [deleteAllConfirmText, setDeleteAllConfirmText] = useState("");

  // Action Menu Dropdown state
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);

  // Bulk Operations
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);

  // AI Task Generation state
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResults, setAiResults] = useState(null); // parsed tasks awaiting review
  const [duplicateMode, setDuplicateMode] = useState("review"); // 'skip', 'keep'
  const [aiLoadingStep, setAiLoadingStep] = useState(0);
  const [aiError, setAiError] = useState("");

  useEffect(() => {
    let interval;
    if (analyzeAiMutation.isPending) {
      setAiLoadingStep(0);
      interval = setInterval(() => {
        setAiLoadingStep((prev) => (prev < 4 ? prev + 1 : prev));
      }, 3000);
    } else {
      setAiLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [analyzeAiMutation.isPending]);

  // Current logged in user name resolver
  const { data: adminMe } = useQuery({
    queryKey: ["admin-me"],
    queryFn: () => apiClient.get("/auth/admin/me").then((r) => r.data.data),
    staleTime: Infinity
  });
  const currentAdminName = adminMe?.name || "Parth";

  // Calculate local today string in YYYY-MM-DD format (GMT+5:30)
  const getTodayStr = () => {
    const offset = 5.5 * 60 * 60 * 1000;
    return new Date(Date.now() + offset).toISOString().split("T")[0];
  };
  const todayStr = getTodayStr();

  // Format Date for humans (e.g. 15 August 2026)
  const formatHumanDate = (dateStr) => {
    if (!dateStr) return "-";
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
  };

  // React Query: Get Dashboard statistics
  const { data: statsData } = useQuery({
    queryKey: ["task-stats"],
    queryFn: () => apiClient.get("/tasks/stats").then((r) => r.data.data),
    refetchInterval: 10000 // poll stats every 10s
  });

  // Build API parameters based on search and filters
  const apiQueryParams = useMemo(() => {
    const params = {
      limit: 1000,
      search: searchQuery || undefined,
      assignedTo: filterPerson !== "All" ? filterPerson : undefined,
      priority: filterPriority !== "All" ? filterPriority : undefined,
      category: filterCategory !== "All" ? filterCategory : undefined,
      status: filterStatus !== "All" ? filterStatus : undefined,
    };

    // Apply Soft Deleted Tasks view
    if (activeTab === "deleted") {
      params.status = "Deleted";
    } else {
      // If we are in specific status filters or quick-views
      if (quickView === "completed") params.status = "Completed";
      else if (quickView === "pending") params.status = "Pending";
      else if (quickView === "overdue") params.status = "Overdue";
      else if (quickView === "my-tasks") params.assignedTo = currentAdminName;
      else if (quickView === "today") params.date = todayStr;
    }

    if (activeTab === "dashboard") {
      params.date = todayStr;
      params.assignedTo = undefined; // Dashboard lists both
      params.status = undefined; // Dashboard shows all statuses
    } else if (activeTab === "calendar") {
      // For calendar view, load a date range matching the active month
      const start = new Date(calendarYear, calendarMonth, 1);
      const end = new Date(calendarYear, calendarMonth + 1, 0);
      params.startDate = start.toISOString().split("T")[0];
      params.endDate = end.toISOString().split("T")[0];
    } else {
      // Date filters on Board
      if (dateFilterType === "today") {
        params.date = todayStr;
      } else if (dateFilterType === "tomorrow") {
        const tomorrow = new Date(Date.now() + 5.5 * 60 * 60 * 1000 + 24 * 60 * 60 * 1000);
        params.date = tomorrow.toISOString().split("T")[0];
      } else if (dateFilterType === "this-week") {
        const now = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(now.setDate(diff));
        const sunday = new Date(monday.getTime() + 6 * 24 * 60 * 60 * 1000);
        params.startDate = monday.toISOString().split("T")[0];
        params.endDate = sunday.toISOString().split("T")[0];
      } else if (dateFilterType === "this-month") {
        const now = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
        const y = now.getFullYear();
        const m = now.getMonth();
        params.startDate = new Date(y, m, 1).toISOString().split("T")[0];
        params.endDate = new Date(y, m + 1, 0).toISOString().split("T")[0];
      } else if (dateFilterType === "custom" && customDateValue) {
        params.date = customDateValue;
      }
    }

    return params;
  }, [activeTab, quickView, searchQuery, filterPerson, filterPriority, filterCategory, filterStatus, dateFilterType, customDateValue, todayStr, calendarYear, calendarMonth, currentAdminName]);

  // React Query: Get tasks list
  const { data: tasksList, isLoading: isTasksLoading } = useQuery({
    queryKey: ["tasks", apiQueryParams],
    queryFn: () => apiClient.get("/tasks", { params: apiQueryParams }).then((r) => r.data.data.items),
  });

  const tasks = tasksList || [];

  // Mutations
  const createTaskMutation = useMutation({
    mutationFn: (payload) => apiClient.post("/tasks", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task-stats"] });
      toast.success("Task created successfully");
      setIsManualModalOpen(false);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to create task");
    }
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, payload }) => apiClient.patch(`/tasks/${id}`, payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task-stats"] });
      toast.success("Task updated successfully");
      
      // Keep detail drawer updated
      if (selectedTask && selectedTask._id === res.data.data._id) {
        setSelectedTask(res.data.data);
      }
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update task");
    }
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id) => apiClient.delete(`/tasks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task-stats"] });
      toast.success("Task moved to Trash");
      setTaskToDelete(null);
      setSelectedTask(null);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete task");
    }
  });

  const restoreTaskMutation = useMutation({
    mutationFn: (id) => apiClient.post(`/tasks/${id}/restore`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task-stats"] });
      toast.success("Task restored successfully");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to restore task");
    }
  });

  const permanentDeleteTaskMutation = useMutation({
    mutationFn: (id) => apiClient.delete(`/tasks/${id}/permanent`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task-stats"] });
      toast.success("Task permanently deleted");
      setSelectedTask(null);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to permanently delete task");
    }
  });

  const analyzeAiMutation = useMutation({
    mutationFn: (paragraph) => apiClient.post("/tasks/ai-analyze", { paragraph }).then((r) => r.data.data),
    onMutate: () => {
      setAiError("");
    },
    onSuccess: (data) => {
      // Pre-select all extracted tasks for import
      const result = data.map((t, idx) => ({ ...t, tempId: idx, selected: true }));
      setAiResults(result);
      toast.success(`Extracted ${data.length} tasks from plan`);
    },
    onError: (err) => {
      console.error("AI parse error:", err);
      if (err.message && (err.message.includes("timeout") || err.message.includes("Network Error") || err.originalError?.code === "ECONNABORTED")) {
        setAiError("AI task generation timed out. Please try again or use a smaller work plan.");
      } else {
        setAiError(err.message || "Failed to generate tasks. Please try again with a simpler description.");
      }
    }
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: ({ ids, action, payload }) => apiClient.post("/tasks/bulk-update", { ids, action, payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task-stats"] });
      toast.success("Bulk operation completed successfully");
      setSelectedTaskIds([]);
    },
    onError: (err) => {
      toast.error(err.message || "Bulk operation failed");
    }
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids) => apiClient.post("/tasks/bulk-delete", { ids }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task-stats"] });
      toast.success("Selected tasks soft-deleted successfully");
      setSelectedTaskIds([]);
      setIsBulkDeleteOpen(false);
    },
    onError: (err) => {
      toast.error(err.message || "Bulk delete failed");
    }
  });

  const deleteFilteredMutation = useMutation({
    mutationFn: (filters) => apiClient.post("/tasks/delete-filtered", { filters }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task-stats"] });
      toast.success(`Deleted ${res.data.data.modifiedCount} filtered tasks`);
      setIsDeleteFilteredOpen(false);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete filtered tasks");
    }
  });

  const deleteAllMutation = useMutation({
    mutationFn: (confirmationText) => apiClient.post("/tasks/delete-all", { confirmationText }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task-stats"] });
      toast.success(`Deleted ${res.data.data.modifiedCount} active tasks`);
      setIsDeleteAllOpen(false);
      setDeleteAllConfirmText("");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete all tasks");
    }
  });

  // Toggle single task completion
  const handleToggleComplete = (task) => {
    const nextStatus = task.status === "Completed" ? "Pending" : "Completed";
    updateTaskMutation.mutate({
      id: task._id,
      payload: { status: nextStatus }
    });
  };

  // Group Dashboard Tasks
  const parthTodayTasks = useMemo(() => {
    return tasks.filter((t) => t.assignedTo === "Parth" || t.assignedTo === "Both");
  }, [tasks]);

  const ronitTodayTasks = useMemo(() => {
    return tasks.filter((t) => t.assignedTo === "Ronit" || t.assignedTo === "Both");
  }, [tasks]);

  // Bulk status update executor
  const handleBulkStatusChange = (status) => {
    if (selectedTaskIds.length === 0) return;
    bulkUpdateMutation.mutate({
      ids: selectedTaskIds,
      action: "status",
      payload: { status }
    });
  };

  const handleBulkAssignChange = (assignedTo) => {
    if (selectedTaskIds.length === 0) return;
    bulkUpdateMutation.mutate({
      ids: selectedTaskIds,
      action: "assign",
      payload: { assignedTo }
    });
  };

  const handleBulkPriorityChange = (priority) => {
    if (selectedTaskIds.length === 0) return;
    bulkUpdateMutation.mutate({
      ids: selectedTaskIds,
      action: "priority",
      payload: { priority }
    });
  };

  // Insert AI parsed tasks into DB
  const handleImportAiTasks = async () => {
    if (!aiResults) return;

    const tasksToImport = aiResults.filter((t) => t.selected);
    if (tasksToImport.length === 0) {
      toast.info("No tasks selected to import");
      return;
    }

    let importedCount = 0;
    for (const task of tasksToImport) {
      // Normalise values, stripping local review helper flags
      const { tempId, selected, warnings, isDuplicate, duplicateTaskId, ...payload } = task;
      
      // Inject AI prompt metadata
      payload.source = "ai";
      payload.originalPrompt = aiPrompt;
      payload.generatedAt = new Date();

      try {
        await apiClient.post("/tasks", payload);
        importedCount++;
      } catch (err) {
        console.error("Failed to insert task:", task.title, err);
      }
    }

    queryClient.invalidateQueries({ queryKey: ["tasks"] });
    queryClient.invalidateQueries({ queryKey: ["task-stats"] });
    toast.success(`Successfully imported ${importedCount} tasks!`);
    
    setIsAiModalOpen(false);
    setAiPrompt("");
    setAiResults(null);
  };

  // Drag-and-drop state changer for Kanban
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, columnStatus) => {
    const taskId = e.dataTransfer.getData("taskId");
    if (!taskId) return;
    updateTaskMutation.mutate({
      id: taskId,
      payload: { status: columnStatus }
    });
  };

  // Calendar Helpers
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay(); // 0 = Sunday, 1 = Monday...
  };

  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(calendarYear, calendarMonth);
    const firstDay = getFirstDayOfMonth(calendarYear, calendarMonth);
    
    const days = [];
    // Pad previous month days
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(new Date(calendarYear, calendarMonth, d));
    }
    return days;
  }, [calendarYear, calendarMonth]);

  const monthLabel = useMemo(() => {
    const date = new Date(calendarYear, calendarMonth, 1);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }, [calendarYear, calendarMonth]);

  const handlePrevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear(calendarYear - 1);
    } else {
      setCalendarMonth(calendarMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear(calendarYear + 1);
    } else {
      setCalendarMonth(calendarMonth + 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader title="Work Management" description="Complete task manager and AI planner module" />
        <div className="flex flex-wrap items-center gap-2 relative">
          <Button
            onClick={() => setIsAiModalOpen(true)}
            variant="outline"
            className="border-primary/30 text-primary hover:bg-primary/5 flex items-center gap-1.5"
          >
            <Sparkles className="h-4 w-4" /> Add Tasks with AI
          </Button>
          <Button
            onClick={() => {
              setEditingTask(null);
              setIsManualModalOpen(true);
            }}
            className="flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" /> Add Task
          </Button>
          <Button
            onClick={() => setIsDeleteAllOpen(true)}
            variant="outline"
            className="border-destructive/30 text-destructive hover:bg-destructive/5 flex items-center gap-1.5"
          >
            <Trash2 className="h-4 w-4" /> Delete All Tasks
          </Button>

          {/* More Actions Menu Button */}
          <div className="relative">
            <Button
              onClick={() => setIsActionsMenuOpen(!isActionsMenuOpen)}
              variant="outline"
              size="icon"
              className="border-border hover:bg-muted"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
            {isActionsMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsActionsMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-56 rounded-md border bg-card shadow-lg z-20 py-1 text-xs text-left">
                  <button
                    onClick={() => {
                      setIsActionsMenuOpen(false);
                      setIsDeleteFilteredOpen(true);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-muted text-stone-200"
                  >
                    Delete All Filtered Tasks
                  </button>
                  <button
                    onClick={() => {
                      setIsActionsMenuOpen(false);
                      setIsDeleteAllOpen(true);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-destructive/10 text-destructive font-semibold border-t"
                  >
                    Delete All Active Tasks
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Overview Cards Panel */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div onClick={() => { setActiveTab("tasks"); setQuickView("all"); }} className="rounded-lg border bg-card p-3 cursor-pointer hover:border-primary/40 transition-all select-none">
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Active Tasks</p>
          <p className="text-xl font-bold mt-0.5 text-stone-200">{statsData?.stats?.totalActive ?? 0}</p>
        </div>
        <div onClick={() => { setActiveTab("dashboard"); }} className="rounded-lg border bg-card p-3 cursor-pointer hover:border-primary/40 transition-all select-none">
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Today's Tasks</p>
          <p className="text-xl font-bold mt-0.5 text-blue-400">{statsData?.stats?.today ?? 0}</p>
        </div>
        <div onClick={() => { setActiveTab("tasks"); setQuickView("pending"); }} className="rounded-lg border bg-card p-3 cursor-pointer hover:border-primary/40 transition-all select-none">
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Pending</p>
          <p className="text-xl font-bold mt-0.5 text-yellow-500">{statsData?.stats?.pending ?? 0}</p>
        </div>
        <div onClick={() => { setActiveTab("tasks"); setQuickView("inProgress"); }} className="rounded-lg border bg-card p-3 cursor-pointer hover:border-primary/40 transition-all select-none">
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">In Progress</p>
          <p className="text-xl font-bold mt-0.5 text-blue-500">{statsData?.stats?.inProgress ?? 0}</p>
        </div>
        <div onClick={() => { setActiveTab("tasks"); setQuickView("completed"); }} className="rounded-lg border bg-card p-3 cursor-pointer hover:border-primary/40 transition-all select-none">
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Completed</p>
          <p className="text-xl font-bold mt-0.5 text-green-500">{statsData?.stats?.completed ?? 0}</p>
        </div>
        <div onClick={() => { setActiveTab("tasks"); setQuickView("overdue"); }} className="rounded-lg border bg-card p-3 cursor-pointer hover:border-primary/40 transition-all select-none">
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Overdue</p>
          <p className="text-xl font-bold mt-0.5 text-destructive">{statsData?.stats?.overdue ?? 0}</p>
        </div>
        <div onClick={() => { setActiveTab("deleted"); }} className="rounded-lg border bg-card p-3 cursor-pointer hover:border-destructive/40 transition-all select-none bg-destructive/5">
          <p className="text-[10px] text-destructive/70 uppercase font-bold tracking-wider">TrashBin</p>
          <p className="text-xl font-bold mt-0.5 text-destructive">{statsData?.stats?.totalDeleted ?? 0}</p>
        </div>
      </div>

      {/* Tabs Navigation Header */}
      <div className="flex border-b border-border gap-1 shrink-0 overflow-x-auto scrollbar-none select-none">
        <button
          onClick={() => { setActiveTab("dashboard"); setQuickView("all"); }}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
            activeTab === "dashboard" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Today's Dashboard
        </button>
        <button
          onClick={() => { setActiveTab("tasks"); setQuickView("all"); }}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
            activeTab === "tasks" && quickView === "all" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          All Active Tasks
        </button>
        <button
          onClick={() => { setActiveTab("tasks"); setQuickView("my-tasks"); }}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
            activeTab === "tasks" && quickView === "my-tasks" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          My Tasks
        </button>
        <button
          onClick={() => { setActiveTab("calendar"); setQuickView("all"); }}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
            activeTab === "calendar" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Calendar Board
        </button>
        <button
          onClick={() => { setActiveTab("deleted"); }}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
            activeTab === "deleted" ? "border-destructive text-destructive font-semibold" : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Deleted Tasks
        </button>
      </div>

      {/* TAB CONTENT: Today's Dashboard */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-muted/20 border p-5 rounded-lg">
            <div>
              <h2 className="text-xl font-bold uppercase tracking-tight">
                GOOD EVENING, {currentAdminName.toUpperCase()} 👋
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                {new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
            
            <div className="w-full md:w-auto flex items-center gap-6">
              <div className="flex flex-col text-center">
                <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Parth</span>
                <span className="text-lg font-bold">
                  {statsData?.parth?.completed ?? 0} / {statsData?.parth?.total ?? 0}
                </span>
              </div>
              <div className="h-8 w-px bg-border hidden sm:block" />
              <div className="flex flex-col text-center">
                <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Ronit</span>
                <span className="text-lg font-bold">
                  {statsData?.ronit?.completed ?? 0} / {statsData?.ronit?.total ?? 0}
                </span>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="flex-1 sm:flex-initial flex flex-col">
                <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Today's Progress</span>
                <div className="flex items-center gap-2 mt-1">
                  <div className="h-2 w-32 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-500"
                      style={{ width: `${statsData?.overall?.progress ?? 0}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold whitespace-nowrap">
                    {statsData?.overall?.progress ?? 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Parth today list */}
            <div className="rounded-lg border bg-card p-5 space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="font-bold flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" /> PARTH'S WORK
                </h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {parthTodayTasks.length} Tasks
                </span>
              </div>

              {isTasksLoading ? (
                <div className="space-y-2 py-4">
                  <div className="h-10 bg-muted animate-pulse rounded" />
                </div>
              ) : parthTodayTasks.length > 0 ? (
                <div className="space-y-3">
                  {parthTodayTasks.map((task) => (
                    <div
                      key={task._id}
                      onClick={() => setSelectedTask(task)}
                      className={cn(
                        "flex items-start justify-between border p-3.5 rounded-md hover:border-primary/50 transition-all cursor-pointer bg-background",
                        task.status === "Completed" && "bg-muted/10 opacity-70"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleComplete(task);
                          }}
                          className="mt-0.5 focus:outline-none"
                        >
                          {task.status === "Completed" ? (
                            <CheckSquare className="h-5 w-5 text-green-500" />
                          ) : (
                            <Square className="h-5 w-5 text-stone-500" />
                          )}
                        </button>
                        <div>
                          <p className={cn("text-sm font-semibold", task.status === "Completed" && "line-through text-stone-400")}>
                            {task.title}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                            {task.startTime && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" /> {task.startTime} – {task.endTime}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Folder className="h-3.5 w-3.5" /> {task.category}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 ml-4">
                        <span className={cn(
                          "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border",
                          task.priority === "Urgent" && "border-red-500/30 bg-red-500/10 text-red-500",
                          task.priority === "High" && "border-orange-500/30 bg-orange-500/10 text-orange-500",
                          task.priority === "Medium" && "border-yellow-500/30 bg-yellow-500/10 text-yellow-500",
                          task.priority === "Low" && "border-blue-500/30 bg-blue-500/10 text-blue-500"
                        )}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-stone-500 py-8 text-xs">No tasks for Parth today</p>
              )}
            </div>

            {/* Ronit today list */}
            <div className="rounded-lg border bg-card p-5 space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="font-bold flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" /> RONIT'S WORK
                </h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {ronitTodayTasks.length} Tasks
                </span>
              </div>

              {isTasksLoading ? (
                <div className="space-y-2 py-4">
                  <div className="h-10 bg-muted animate-pulse rounded" />
                </div>
              ) : ronitTodayTasks.length > 0 ? (
                <div className="space-y-3">
                  {ronitTodayTasks.map((task) => (
                    <div
                      key={task._id}
                      onClick={() => setSelectedTask(task)}
                      className={cn(
                        "flex items-start justify-between border p-3.5 rounded-md hover:border-primary/50 transition-all cursor-pointer bg-background",
                        task.status === "Completed" && "bg-muted/10 opacity-70"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleComplete(task);
                          }}
                          className="mt-0.5 focus:outline-none"
                        >
                          {task.status === "Completed" ? (
                            <CheckSquare className="h-5 w-5 text-green-500" />
                          ) : (
                            <Square className="h-5 w-5 text-stone-500" />
                          )}
                        </button>
                        <div>
                          <p className={cn("text-sm font-semibold", task.status === "Completed" && "line-through text-stone-400")}>
                            {task.title}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                            {task.startTime && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" /> {task.startTime} – {task.endTime}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Folder className="h-3.5 w-3.5" /> {task.category}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 ml-4">
                        <span className={cn(
                          "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border",
                          task.priority === "Urgent" && "border-red-500/30 bg-red-500/10 text-red-500",
                          task.priority === "High" && "border-orange-500/30 bg-orange-500/10 text-orange-500",
                          task.priority === "Medium" && "border-yellow-500/30 bg-yellow-500/10 text-yellow-500",
                          task.priority === "Low" && "border-blue-500/30 bg-blue-500/10 text-blue-500"
                        )}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-stone-500 py-8 text-xs">No tasks for Ronit today</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Task Board (All Active / My Tasks) */}
      {(activeTab === "tasks") && (
        <div className="space-y-6">
          {/* Filtering row */}
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center bg-card border p-4 rounded-lg">
            <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-10 w-full rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              
              <div className="flex border rounded-md p-0.5 bg-muted/20 shrink-0">
                <button
                  onClick={() => setTaskBoardView("list")}
                  className={cn("px-3 h-8 rounded text-xs font-medium flex items-center gap-1.5 transition-colors", taskBoardView === "list" ? "bg-background text-foreground shadow" : "text-muted-foreground hover:text-foreground")}
                >
                  <List className="h-3.5 w-3.5" /> List
                </button>
                <button
                  onClick={() => setTaskBoardView("kanban")}
                  className={cn("px-3 h-8 rounded text-xs font-medium flex items-center gap-1.5 transition-colors", taskBoardView === "kanban" ? "bg-background text-foreground shadow" : "text-muted-foreground hover:text-foreground")}
                >
                  <KanbanIcon className="h-3.5 w-3.5" /> Kanban
                </button>
              </div>
            </div>

            <div className="w-full lg:w-auto flex flex-wrap items-center gap-2">
              {["All", "today", "tomorrow", "this-week", "this-month"].map((t) => (
                <button
                  key={t}
                  onClick={() => setDateFilterType(t)}
                  className={cn(
                    "px-3 h-8 rounded text-xs font-medium capitalize border transition-all",
                    dateFilterType === t ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t === "All" ? "All Dates" : t.replace("-", " ")}
                </button>
              ))}

              <div className="flex items-center gap-2 border rounded-md h-8 px-2 bg-background">
                <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="date"
                  value={customDateValue}
                  onChange={(e) => {
                    setCustomDateValue(e.target.value);
                    setDateFilterType("custom");
                  }}
                  className="text-xs bg-transparent border-none focus:outline-none focus:ring-0 w-28"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-muted/10 p-3 rounded-lg border">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Assignee</label>
              <select
                value={filterPerson}
                onChange={(e) => setFilterPerson(e.target.value)}
                className="h-9 w-full rounded border bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="All">All People</option>
                <option value="Parth">Parth</option>
                <option value="Ronit">Ronit</option>
                <option value="Both">Both</option>
                <option value="Unassigned">Unassigned</option>
              </select>
            </div>
            
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Priority</label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="h-9 w-full rounded border bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="All">All Priorities</option>
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Category</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="h-9 w-full rounded border bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="All">All Categories</option>
                {DEFAULT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="h-9 w-full rounded border bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="All">All Statuses</option>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Sticky Bulk operations toolbar */}
          {selectedTaskIds.length > 0 && (
            <div className="sticky bottom-4 z-30 flex flex-wrap gap-3 items-center justify-between bg-card border border-primary/20 p-4 rounded-lg shadow-xl animate-in slide-in-from-bottom-2 duration-300">
              <span className="text-xs font-semibold text-primary">
                {selectedTaskIds.length} tasks selected
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  onChange={(e) => handleBulkStatusChange(e.target.value)}
                  defaultValue=""
                  className="h-8 rounded border bg-background px-2 text-xs focus:outline-none"
                >
                  <option value="" disabled>Change Status</option>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>

                <select
                  onChange={(e) => handleBulkAssignChange(e.target.value)}
                  defaultValue=""
                  className="h-8 rounded border bg-background px-2 text-xs focus:outline-none"
                >
                  <option value="" disabled>Assign To</option>
                  <option value="Parth">Parth</option>
                  <option value="Ronit">Ronit</option>
                  <option value="Both">Both</option>
                  <option value="Unassigned">Unassigned</option>
                </select>

                <select
                  onChange={(e) => handleBulkPriorityChange(e.target.value)}
                  defaultValue=""
                  className="h-8 rounded border bg-background px-2 text-xs focus:outline-none"
                >
                  <option value="" disabled>Change Priority</option>
                  {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>

                <Button
                  onClick={() => setIsBulkDeleteOpen(true)}
                  size="sm"
                  variant="outline"
                  className="text-xs h-8 text-destructive border-destructive/20 hover:bg-destructive/10"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete Selected
                </Button>
              </div>
            </div>
          )}

          {/* Views Layout */}
          {isTasksLoading ? (
            <div className="space-y-4 py-8">
              <div className="h-12 bg-muted animate-pulse rounded" />
              <div className="h-12 bg-muted animate-pulse rounded" />
            </div>
          ) : taskBoardView === "list" ? (
            /* LIST VIEW */
            <div className="rounded-lg border bg-card overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b bg-muted/30 text-xs font-bold uppercase tracking-wider text-muted-foreground select-none">
                    <th className="p-3 w-10">
                      <input
                        type="checkbox"
                        checked={tasks.length > 0 && selectedTaskIds.length === tasks.length}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedTaskIds(tasks.map(t => t._id));
                          else setSelectedTaskIds([]);
                        }}
                        className="rounded"
                      />
                    </th>
                    <th className="p-3">Task</th>
                    <th className="p-3 w-32">Date</th>
                    <th className="p-3 w-36">Time</th>
                    <th className="p-3 w-32">Assignee</th>
                    <th className="p-3 w-32">Category</th>
                    <th className="p-3 w-24">Priority</th>
                    <th className="p-3 w-28">Status</th>
                    <th className="p-3 w-24 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {tasks.length > 0 ? (
                    tasks.map((task) => (
                      <tr
                        key={task._id}
                        onClick={() => setSelectedTask(task)}
                        className={cn("hover:bg-muted/30 cursor-pointer transition-colors bg-card", task.status === "Completed" && "opacity-75")}
                      >
                        <td className="p-3 align-middle" onClick={e => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedTaskIds.includes(task._id)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedTaskIds([...selectedTaskIds, task._id]);
                              else setSelectedTaskIds(selectedTaskIds.filter(id => id !== task._id));
                            }}
                            className="rounded"
                          />
                        </td>
                        <td className="p-3 font-medium align-middle">
                          <div>
                            <span className={cn(task.status === "Completed" && "line-through text-stone-400")}>{task.title}</span>
                            {task.description && (
                              <p className="text-xs text-stone-400 mt-0.5 truncate max-w-md font-normal">{task.description}</p>
                            )}
                          </div>
                        </td>
                        <td className="p-3 align-middle text-stone-300 font-medium whitespace-nowrap">
                          {formatHumanDate(task.date)}
                        </td>
                        <td className="p-3 align-middle text-stone-400 whitespace-nowrap">
                          {task.startTime ? `${task.startTime} – ${task.endTime || "End Time null"}` : "Not specified"}
                        </td>
                        <td className="p-3 align-middle font-medium text-stone-300">
                          {task.assignedTo}
                        </td>
                        <td className="p-3 align-middle">
                          <span className="text-xs bg-secondary px-2.5 py-0.5 rounded-full border text-stone-300 font-medium">
                            {task.category}
                          </span>
                        </td>
                        <td className="p-3 align-middle">
                          <span className={cn(
                            "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border",
                            task.priority === "Urgent" && "border-red-500/30 bg-red-500/10 text-red-500",
                            task.priority === "High" && "border-orange-500/30 bg-orange-500/10 text-orange-500",
                            task.priority === "Medium" && "border-yellow-500/30 bg-yellow-500/10 text-yellow-500",
                            task.priority === "Low" && "border-blue-500/30 bg-blue-500/10 text-blue-500"
                          )}>
                            {task.priority}
                          </span>
                        </td>
                        <td className="p-3 align-middle">
                          <span className={cn(
                            "text-xs px-2.5 py-0.5 rounded-full font-semibold border",
                            task.status === "Completed" && "bg-green-500/10 text-green-500 border-green-500/30",
                            task.status === "Pending" && "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
                            task.status === "In Progress" && "bg-blue-500/10 text-blue-500 border-blue-500/30",
                            task.status === "Cancelled" && "bg-stone-500/10 text-stone-400 border-stone-500/30",
                            task.status === "Overdue" && "bg-red-500/10 text-red-500 border-red-500/30"
                          )}>
                            {task.status}
                          </span>
                        </td>
                        <td className="p-3 align-middle text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setEditingTask(task);
                                setIsManualModalOpen(true);
                              }}
                              className="p-1.5 hover:bg-muted rounded text-stone-400 hover:text-white"
                              title="Edit task"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setTaskToDelete(task)}
                              className="p-1.5 hover:bg-destructive/10 rounded text-stone-400 hover:text-destructive"
                              title="Delete task"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="p-8 text-center text-stone-400 text-xs font-medium">
                        No tasks active or matching filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* KANBAN VIEW */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {STATUSES.filter(s => s !== "Overdue").map((columnStatus) => {
                const columnTasks = tasks.filter((t) => t.status === columnStatus || (columnStatus === "Pending" && t.status === "Overdue"));
                
                return (
                  <div
                    key={columnStatus}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, columnStatus)}
                    className="flex flex-col rounded-lg border bg-card p-4 space-y-4 min-h-[600px] transition-all hover:bg-muted/10"
                  >
                    <div className="flex items-center justify-between border-b pb-2 select-none">
                      <h4 className="font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <span className={cn(
                          "h-2 w-2 rounded-full",
                          columnStatus === "Completed" && "bg-green-500",
                          columnStatus === "Pending" && "bg-yellow-500",
                          columnStatus === "In Progress" && "bg-blue-500",
                          columnStatus === "Cancelled" && "bg-stone-500"
                        )} />
                        {columnStatus}
                      </h4>
                      <span className="text-xs bg-muted/40 font-semibold px-2 py-0.5 rounded">
                        {columnTasks.length}
                      </span>
                    </div>

                    <div className="flex-1 space-y-3 overflow-y-auto max-h-[700px] scrollbar-none pr-1">
                      {columnTasks.length > 0 ? (
                        columnTasks.map((task) => (
                          <div
                            key={task._id}
                            draggable
                            onDragStart={(e) => e.dataTransfer.setData("taskId", task._id)}
                            onClick={() => setSelectedTask(task)}
                            className={cn(
                              "border rounded-md p-3.5 shadow-sm bg-background hover:border-primary/50 transition-all cursor-grab active:cursor-grabbing",
                              task.status === "Overdue" && "border-red-500/50 bg-red-500/5"
                            )}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <p className={cn("text-xs font-semibold leading-tight", task.status === "Completed" && "line-through text-stone-400")}>
                                {task.title}
                              </p>
                              <span className={cn(
                                "text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded",
                                task.priority === "Urgent" && "bg-red-500/10 text-red-500",
                                task.priority === "High" && "bg-orange-500/10 text-orange-500",
                                task.priority === "Medium" && "bg-yellow-500/10 text-yellow-500",
                                task.priority === "Low" && "bg-blue-500/10 text-blue-500"
                              )}>
                                {task.priority}
                              </span>
                            </div>
                            
                            {task.description && (
                              <p className="text-[11px] text-stone-400 mt-1.5 line-clamp-2 leading-relaxed">
                                {task.description}
                              </p>
                            )}

                            <div className="flex flex-col gap-1.5 mt-3 pt-3 border-t text-[10px] text-stone-400">
                              <div className="flex items-center gap-1">
                                <CalendarIcon className="h-3.5 w-3.5" /> {formatHumanDate(task.date)}
                              </div>
                              {task.startTime && (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5" /> {task.startTime} – {task.endTime}
                                </div>
                              )}
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-[9px] bg-secondary px-2 py-0.5 rounded border">
                                  {task.category}
                                </span>
                                <span className="font-semibold text-stone-300">
                                  Assignee: {task.assignedTo}
                                </span>
                              </div>
                            </div>

                            {task.status === "Overdue" && (
                              <div className="mt-2.5 flex items-center gap-1 bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider w-fit">
                                <AlertCircle className="h-3 w-3" /> Overdue
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-[10px] text-stone-500 py-12">Drag tasks here</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: Calendar Board */}
      {activeTab === "calendar" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-card border p-4 rounded-lg select-none">
            <h3 className="font-bold text-sm text-stone-200">{monthLabel}</h3>
            <div className="flex gap-2">
              <Button onClick={handlePrevMonth} variant="outline" size="icon" className="h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button onClick={handleNextMonth} variant="outline" size="icon" className="h-8 w-8">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-stone-400 select-none border-b pb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => <span key={day}>{day}</span>)}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} className="bg-muted/5 border border-dashed aspect-square rounded-md opacity-25" />;
              
              const dateStr = day.toISOString().split("T")[0];
              const dayTasks = tasks.filter(t => t.date === dateStr);
              
              return (
                <div
                  key={dateStr}
                  className="bg-card border p-2 min-h-[90px] rounded-md flex flex-col justify-between hover:border-primary/50 transition-all select-none"
                >
                  <span className="text-xs font-bold text-stone-400">{day.getDate()}</span>
                  
                  <div className="flex-1 mt-1 space-y-1 overflow-y-auto max-h-[70px] scrollbar-none">
                    {dayTasks.map(t => (
                      <div
                        key={t._id}
                        onClick={() => setSelectedTask(t)}
                        className={cn(
                          "text-[9px] truncate px-1.5 py-0.5 rounded cursor-pointer leading-tight",
                          t.status === "Completed" ? "bg-green-500/10 text-green-500 border border-green-500/20" :
                          t.status === "Overdue" ? "bg-red-500/10 text-red-500 border border-red-500/20" :
                          "bg-primary/10 text-primary border border-primary/20"
                        )}
                        title={t.title}
                      >
                        {t.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Deleted Tasks (Trash Bin) */}
      {activeTab === "deleted" && (
        <div className="space-y-4">
          <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-lg text-xs leading-relaxed flex items-start gap-2.5">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <div>
              <span className="font-bold block">Deleted Tasks Bin:</span>
              Tasks shown here have been soft-deleted. They will not show up in calendar, dashboards, or progress charts. You can restore them to active boards or permanently delete them from the database.
            </div>
          </div>

          <div className="rounded-lg border bg-card overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b bg-muted/30 font-bold uppercase tracking-wider text-muted-foreground select-none">
                  <th className="p-3.5">Task Title</th>
                  <th className="p-3.5 w-32">Original Date</th>
                  <th className="p-3.5 w-32">Assigned Person</th>
                  <th className="p-3.5 w-36">Deleted By</th>
                  <th className="p-3.5 w-36">Deleted At</th>
                  <th className="p-3.5 w-44 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {isTasksLoading ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-stone-400">Loading TrashBin...</td>
                  </tr>
                ) : tasks.length > 0 ? (
                  tasks.map((task) => (
                    <tr key={task._id} className="hover:bg-muted/15 bg-card">
                      <td className="p-3.5 font-medium align-middle">
                        <div>
                          <p className="text-foreground">{task.title}</p>
                          {task.description && <p className="text-xs text-stone-400 mt-0.5 line-clamp-1">{task.description}</p>}
                        </div>
                      </td>
                      <td className="p-3.5 align-middle text-stone-300 font-medium whitespace-nowrap">
                        {formatHumanDate(task.date)}
                      </td>
                      <td className="p-3.5 align-middle text-stone-400 whitespace-nowrap">
                        {task.assignedTo}
                      </td>
                      <td className="p-3.5 align-middle text-stone-300">
                        {task.deletedBy || "System"}
                      </td>
                      <td className="p-3.5 align-middle text-stone-400 whitespace-nowrap">
                        {task.deletedAt ? new Date(task.deletedAt).toLocaleDateString("en-US", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "-"}
                      </td>
                      <td className="p-3.5 align-middle text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            onClick={() => restoreTaskMutation.mutate(task._id)}
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs flex items-center gap-1"
                          >
                            <Undo2 className="h-3.5 w-3.5" /> Restore
                          </Button>
                          <Button
                            onClick={() => {
                              if (confirm("This action cannot be undone and will permanently delete this task. Delete Permanently?")) {
                                permanentDeleteTaskMutation.mutate(task._id);
                              }
                            }}
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs text-destructive border-destructive/20 hover:bg-destructive/10 flex items-center gap-1"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Permanent Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-stone-500 text-xs">
                      Trash Bin is empty.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: AI Task Import */}
      <AnimatePresence>
        {isAiModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/85 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-5xl rounded-lg border bg-card p-6 shadow-2xl flex flex-col max-h-[85vh]"
            >
              <button
                disabled={analyzeAiMutation.isPending}
                onClick={() => {
                  if (analyzeAiMutation.isPending) return;
                  setIsAiModalOpen(false);
                  setAiPrompt("");
                  setAiResults(null);
                  setAiError("");
                }}
                className="absolute top-4 right-4 text-stone-400 hover:text-white disabled:opacity-30"
              >
                <X className="h-5 w-5" />
              </button>

              <h3 className="font-display text-xl font-bold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary animate-pulse" /> Add Tasks with AI
              </h3>
              
              {!aiResults ? (
                /* Prompt Input */
                <div className="space-y-4 mt-4">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Paste a paragraph detailing your upcoming work plan. The AI will analyze the dates, times, tasks, and asignees to segment them into clean, structured records.
                  </p>
                  
                  {aiError && (
                    <div className="bg-destructive/10 border border-destructive/20 p-3 rounded-md flex items-start gap-2.5 text-xs text-red-400 font-semibold leading-relaxed">
                      <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                      <div>{aiError}</div>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-semibold text-stone-300 block mb-1.5">Paste your work plan</label>
                    <textarea
                      disabled={analyzeAiMutation.isPending}
                      rows="6"
                      placeholder='Example: "On 15 August Parth will research AI from 8:40 to 9:05. Ronit will create the AI demo. After that Parth will write the LinkedIn post."'
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      className="w-full rounded-md border bg-background p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed disabled:opacity-50"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" disabled={analyzeAiMutation.isPending} onClick={() => { setIsAiModalOpen(false); setAiError(""); }}>Cancel</Button>
                    <Button
                      disabled={!aiPrompt.trim() || analyzeAiMutation.isPending}
                      onClick={() => analyzeAiMutation.mutate(aiPrompt)}
                      className="flex items-center gap-1.5 min-w-[220px] justify-center"
                    >
                      {analyzeAiMutation.isPending ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                          {aiLoadingStep === 0 && "✨ Analyzing your work plan..."}
                          {aiLoadingStep === 1 && "Extracting dates..."}
                          {aiLoadingStep === 2 && "Understanding assignments..."}
                          {aiLoadingStep === 3 && "Creating tasks..."}
                          {aiLoadingStep >= 4 && "Preparing review..."}
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" /> Generate Tasks
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                /* Review Table (AI edit before import) */
                <div className="space-y-4 mt-4 flex flex-col flex-1 overflow-hidden">
                  
                  {(() => {
                    const incompleteCount = aiResults.filter(t => t.warnings.length > 0).length;
                    const duplicateCount = aiResults.filter(t => t.isDuplicate).length;
                    if (incompleteCount > 0 || duplicateCount > 0) {
                      return (
                        <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-md flex items-start gap-2.5 text-xs text-yellow-500">
                          <AlertTriangle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold block">Import checklist requires review:</span>
                            {incompleteCount > 0 && <span>• {incompleteCount} tasks have missing information. </span>}
                            {duplicateCount > 0 && <span>• {duplicateCount} similar tasks already exist in the database. </span>}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {aiResults.some(t => t.isDuplicate) && (
                    <div className="flex items-center justify-between bg-muted/40 p-2.5 rounded border text-xs">
                      <span className="font-semibold flex items-center gap-1"><Info className="h-4 w-4 text-primary" /> Duplicate actions found:</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setDuplicateMode("skip");
                            setAiResults(aiResults.map(t => t.isDuplicate ? { ...t, selected: false } : t));
                          }}
                          className={cn("px-2.5 py-1 rounded border capitalize transition-all", duplicateMode === "skip" ? "bg-background text-foreground shadow font-semibold" : "text-muted-foreground")}
                        >
                          Skip duplicates
                        </button>
                        <button
                          onClick={() => {
                            setDuplicateMode("keep");
                            setAiResults(aiResults.map(t => t.isDuplicate ? { ...t, selected: true } : t));
                          }}
                          className={cn("px-2.5 py-1 rounded border capitalize transition-all", duplicateMode === "keep" ? "bg-background text-foreground shadow font-semibold" : "text-muted-foreground")}
                        >
                          Import anyway
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex-1 overflow-auto border rounded-md">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b bg-muted/30 font-bold uppercase tracking-wider text-stone-400 sticky top-0 bg-card">
                          <th className="p-3 w-10">✓</th>
                          <th className="p-3 w-28">Date</th>
                          <th className="p-3 w-32">Time</th>
                          <th className="p-3 w-24">Person</th>
                          <th className="p-3 w-28">Category</th>
                          <th className="p-3">Task Title</th>
                          <th className="p-3 w-20">Priority</th>
                          <th className="p-3 w-24 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {aiResults.map((item, idx) => (
                          <tr key={item.tempId} className={cn("hover:bg-muted/10 bg-card", item.isDuplicate && "bg-red-500/5")}>
                            <td className="p-3 align-middle">
                              <input
                                type="checkbox"
                                checked={item.selected}
                                onChange={(e) => {
                                  const updated = [...aiResults];
                                  updated[idx].selected = e.target.checked;
                                  setAiResults(updated);
                                }}
                                className="rounded"
                              />
                            </td>
                            <td className="p-3 align-middle font-medium">
                              {item.date ? (
                                <span className="whitespace-nowrap">{formatHumanDate(item.date)}</span>
                              ) : (
                                <span className="text-red-500 font-semibold flex items-center gap-1">
                                  <AlertCircle className="h-3.5 w-3.5" /> Missing
                                </span>
                              )}
                            </td>
                            <td className="p-3 align-middle text-stone-400">
                              {item.startTime ? (
                                <span className="whitespace-nowrap">{item.startTime} – {item.endTime || "null"}</span>
                              ) : (
                                <span className="text-yellow-500 font-medium">Not specified</span>
                              )}
                            </td>
                            <td className="p-3 align-middle font-semibold text-stone-300">
                              {item.assignedTo === "Unassigned" ? (
                                <span className="text-yellow-500 flex items-center gap-0.5">⚠️ Unassigned</span>
                              ) : (
                                item.assignedTo
                              )}
                            </td>
                            <td className="p-3 align-middle">
                              <span className="bg-secondary px-2 py-0.5 rounded border text-[10px] text-stone-300">
                                {item.category}
                              </span>
                            </td>
                            <td className="p-3 align-middle font-medium leading-relaxed">
                              <div>
                                <p className="text-foreground">{item.title}</p>
                                {item.description && <p className="text-[10px] text-stone-400 mt-0.5 line-clamp-1">{item.description}</p>}
                                {item.isDuplicate && (
                                  <span className="text-[9px] font-bold text-red-500 uppercase tracking-wider block mt-1">
                                    ⚠️ Possible Duplicate
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-3 align-middle">
                              <span className={cn(
                                "text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded",
                                item.priority === "Urgent" && "bg-red-500/10 text-red-500",
                                item.priority === "High" && "bg-orange-500/10 text-orange-500",
                                item.priority === "Medium" && "bg-yellow-500/10 text-yellow-500",
                                item.priority === "Low" && "bg-blue-500/10 text-blue-500"
                              )}>
                                {item.priority}
                              </span>
                            </td>
                            <td className="p-3 align-middle text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    setEditingTask(item);
                                    setIsManualModalOpen(true);
                                  }}
                                  className="p-1.5 hover:bg-muted rounded text-stone-400 hover:text-white"
                                  title="Edit extracted task"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    setAiResults(aiResults.filter((t) => t.tempId !== item.tempId));
                                  }}
                                  className="p-1.5 hover:bg-destructive/10 rounded text-stone-400 hover:text-destructive"
                                  title="Delete extracted task"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <Button variant="outline" onClick={() => setAiResults(null)}>Back</Button>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setIsAiModalOpen(false)}>Cancel</Button>
                      <Button onClick={handleImportAiTasks} className="flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4" /> Confirm & Add Selected Tasks ({aiResults.filter(t => t.selected).length})
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Add/Edit Task Manually */}
      <AnimatePresence>
        {isManualModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/85 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg rounded-lg border bg-card p-6 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="absolute top-4 right-4 text-stone-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>

              <h3 className="font-display text-lg font-bold border-b pb-2 mb-4">
                {editingTask ? (editingTask.tempId !== undefined ? "Edit Extracted Task" : "Edit Task") : "Add Task Manually"}
              </h3>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const data = new FormData(e.currentTarget);
                  const payload = {
                    title: data.get("title"),
                    description: data.get("description"),
                    date: data.get("date"),
                    startTime: data.get("startTime") || null,
                    endTime: data.get("endTime") || null,
                    assignedTo: data.get("assignedTo"),
                    category: data.get("category"),
                    priority: data.get("priority"),
                    status: data.get("status"),
                    notes: data.get("notes")
                  };

                  if (editingTask) {
                    if (editingTask.tempId !== undefined) {
                      // Modifying local AI array
                      const updated = aiResults.map((t) => {
                        if (t.tempId === editingTask.tempId) {
                          const warnings = [];
                          if (payload.assignedTo === "Unassigned") warnings.push("assignedTo");
                          if (!payload.date) warnings.push("date");
                          if (!payload.startTime) warnings.push("time");
                          
                          return { ...t, ...payload, warnings };
                        }
                        return t;
                      });
                      setAiResults(updated);
                      setIsManualModalOpen(false);
                      setEditingTask(null);
                    } else {
                      // Save to DB task
                      updateTaskMutation.mutate({
                        id: editingTask._id,
                        payload
                      });
                      setIsManualModalOpen(false);
                      setEditingTask(null);
                    }
                  } else {
                    // Create new
                    createTaskMutation.mutate(payload);
                  }
                }}
                className="space-y-4 text-sm"
              >
                <div>
                  <label className="text-xs font-semibold text-stone-300 block mb-1">Task Title *</label>
                  <input
                    required
                    type="text"
                    name="title"
                    defaultValue={editingTask?.title || ""}
                    placeholder="e.g. Check website checklist"
                    className="w-full rounded border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-300 block mb-1">Description</label>
                  <textarea
                    rows="2"
                    name="description"
                    defaultValue={editingTask?.description || ""}
                    placeholder="Add details about the task..."
                    className="w-full rounded border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-stone-300 block mb-1">Date *</label>
                    <input
                      required
                      type="date"
                      name="date"
                      defaultValue={editingTask?.date || todayStr}
                      className="w-full rounded border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-stone-300 block mb-1">Assigned To</label>
                    <select
                      name="assignedTo"
                      defaultValue={editingTask?.assignedTo || "Unassigned"}
                      className="w-full rounded border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="Parth">Parth</option>
                      <option value="Ronit">Ronit</option>
                      <option value="Both">Both</option>
                      <option value="Unassigned">Unassigned</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-stone-300 block mb-1">Start Time</label>
                    <input
                      type="text"
                      name="startTime"
                      defaultValue={editingTask?.startTime || ""}
                      placeholder="e.g. 08:40 PM"
                      className="w-full rounded border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-stone-300 block mb-1">End Time</label>
                    <input
                      type="text"
                      name="endTime"
                      defaultValue={editingTask?.endTime || ""}
                      placeholder="e.g. 09:05 PM"
                      className="w-full rounded border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-1">
                    <label className="text-xs font-semibold text-stone-300 block mb-1">Priority</label>
                    <select
                      name="priority"
                      defaultValue={editingTask?.priority || "Medium"}
                      className="w-full rounded border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="col-span-1">
                    <label className="text-xs font-semibold text-stone-300 block mb-1">Status</label>
                    <select
                      name="status"
                      defaultValue={editingTask?.status || "Pending"}
                      className="w-full rounded border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="col-span-1">
                    <label className="text-xs font-semibold text-stone-300 block mb-1">Category</label>
                    <input
                      list="manual-categories"
                      name="category"
                      defaultValue={editingTask?.category || "Other"}
                      className="w-full rounded border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <datalist id="manual-categories">
                      {DEFAULT_CATEGORIES.map(c => <option key={c} value={c} />)}
                    </datalist>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-300 block mb-1">Notes</label>
                  <textarea
                    rows="2"
                    name="notes"
                    defaultValue={editingTask?.notes || ""}
                    placeholder="Add task notes or constraints..."
                    className="w-full rounded border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t">
                  <Button type="button" variant="outline" onClick={() => setIsManualModalOpen(false)}>Cancel</Button>
                  <Button type="submit" className="px-5">Save</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DRAWER: Task Details & History */}
      <AnimatePresence>
        {selectedTask && (
          <div className="fixed inset-0 z-40 flex justify-end bg-background/80 backdrop-blur-sm">
            <div className="absolute inset-0 cursor-pointer" onClick={() => setSelectedTask(null)} />
            
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md h-full bg-card border-l shadow-2xl flex flex-col p-6 overflow-y-auto z-10"
            >
              <button onClick={() => setSelectedTask(null)} className="absolute top-6 left-6 text-stone-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>

              <div className="flex justify-end gap-2 mb-6">
                <Button
                  onClick={() => {
                    setEditingTask(selectedTask);
                    setIsManualModalOpen(true);
                  }}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 text-xs"
                >
                  <Edit2 className="h-3.5 w-3.5" /> Edit
                </Button>
                <Button
                  onClick={() => setTaskToDelete(selectedTask)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 text-xs border-destructive/20 text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </Button>
              </div>

              <div className="space-y-5 flex-1 text-xs">
                <div>
                  <h3 className="text-lg font-bold tracking-tight leading-snug text-foreground">
                    {selectedTask.title}
                  </h3>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Created by {selectedTask.createdBy || "System"} on {new Date(selectedTask.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {selectedTask.description && (
                  <div className="bg-muted/10 border p-3 rounded-md">
                    <p className="font-bold uppercase tracking-wider text-stone-400 mb-1">Description</p>
                    <p className="leading-relaxed text-stone-300 font-medium">{selectedTask.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-stone-400 block font-semibold mb-0.5">Scheduled Date</span>
                    <span className="font-bold text-stone-200">{formatHumanDate(selectedTask.date)}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block font-semibold mb-0.5">Assigned To</span>
                    <span className="font-bold text-stone-200 flex items-center gap-1">
                      <UserCheck className="h-3.5 w-3.5 text-primary" /> {selectedTask.assignedTo}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 block font-semibold mb-0.5">Time</span>
                    <span className="font-bold text-stone-200">
                      {selectedTask.startTime ? `${selectedTask.startTime} – ${selectedTask.endTime || "null"}` : "Not specified"}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 block font-semibold mb-0.5">Category</span>
                    <span className="font-bold text-stone-200">{selectedTask.category}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block font-semibold mb-0.5">Priority</span>
                    <span className={cn(
                      "font-bold uppercase tracking-wider text-[10px] w-fit rounded px-1.5 py-0.5",
                      selectedTask.priority === "Urgent" && "bg-red-500/10 text-red-500",
                      selectedTask.priority === "High" && "bg-orange-500/10 text-orange-500",
                      selectedTask.priority === "Medium" && "bg-yellow-500/10 text-yellow-500",
                      selectedTask.priority === "Low" && "bg-blue-500/10 text-blue-500"
                    )}>
                      {selectedTask.priority}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 block font-semibold mb-0.5">Status</span>
                    <span className={cn(
                      "font-bold text-xs rounded px-2 py-0.5 w-fit border",
                      selectedTask.status === "Completed" && "bg-green-500/10 text-green-500 border-green-500/30",
                      selectedTask.status === "Pending" && "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
                      selectedTask.status === "In Progress" && "bg-blue-500/10 text-blue-500 border-blue-500/30",
                      selectedTask.status === "Cancelled" && "bg-stone-500/10 text-stone-400 border-stone-500/30",
                      selectedTask.status === "Overdue" && "bg-red-500/10 text-red-500 border-red-500/30"
                    )}>
                      {selectedTask.status}
                    </span>
                  </div>
                </div>

                {selectedTask.notes && (
                  <div className="bg-muted/10 border p-3 rounded-md">
                    <p className="font-bold uppercase tracking-wider text-stone-400 mb-1">Notes</p>
                    <p className="leading-relaxed text-stone-300 font-medium">{selectedTask.notes}</p>
                  </div>
                )}

                <div className="border-t pt-4 space-y-4">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                    <Clock className="h-4 w-4" /> Activity History
                  </h4>
                  
                  <div className="relative border-l pl-4 space-y-4 pr-1">
                    {selectedTask.history && selectedTask.history.length > 0 ? (
                      selectedTask.history.map((entry, idx) => (
                        <div key={idx} className="relative">
                          <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-primary border border-background" />
                          <div>
                            <p className="font-semibold text-stone-200">{entry.action}</p>
                            {entry.details && <p className="text-stone-400 mt-0.5">{entry.details}</p>}
                            <p className="text-[10px] text-stone-500 mt-1">
                              {entry.performedBy} • {new Date(entry.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-stone-500 italic">No logs available</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DIALOG: Individual Task Delete Confirmation */}
      <AnimatePresence>
        {taskToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/85 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm rounded-lg border bg-card p-6 shadow-2xl text-center space-y-4"
            >
              <h3 className="font-bold text-lg text-stone-200">Delete this task?</h3>
              <div className="bg-muted/30 border p-3 rounded text-left text-xs space-y-1.5">
                <p className="font-semibold text-foreground">Task: <span className="font-normal text-stone-300">{taskToDelete.title}</span></p>
                <p className="font-semibold text-foreground">Assigned: <span className="font-normal text-stone-300">{taskToDelete.assignedTo}</span></p>
              </div>
              <div className="flex justify-center gap-3 pt-2">
                <Button variant="outline" onClick={() => setTaskToDelete(null)}>Cancel</Button>
                <Button
                  onClick={() => deleteTaskMutation.mutate(taskToDelete._id)}
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                >
                  Delete Task
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DIALOG: Bulk Delete Confirmation */}
      <AnimatePresence>
        {isBulkDeleteOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/85 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm rounded-lg border bg-card p-6 shadow-2xl text-center space-y-4"
            >
              <h3 className="font-bold text-lg text-stone-200">Delete {selectedTaskIds.length} selected tasks?</h3>
              <p className="text-xs text-muted-foreground">
                These tasks will be soft-deleted and moved to the Deleted Tasks bin.
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <Button variant="outline" onClick={() => setIsBulkDeleteOpen(false)}>Cancel</Button>
                <Button
                  onClick={() => bulkDeleteMutation.mutate(selectedTaskIds)}
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                >
                  Delete Selected
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DIALOG: Delete Filtered Tasks Confirmation */}
      <AnimatePresence>
        {isDeleteFilteredOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/85 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm rounded-lg border bg-card p-6 shadow-2xl text-center space-y-4"
            >
              <h3 className="font-bold text-lg text-stone-200">Delete matching tasks?</h3>
              <p className="text-xs text-stone-300">
                This will soft-delete ONLY the tasks matching your active filters.
              </p>
              <div className="bg-muted/30 border p-3 rounded text-left text-xs space-y-1">
                <p><span className="font-semibold text-stone-400">Search:</span> {searchQuery || "None"}</p>
                <p><span className="font-semibold text-stone-400">Assignee:</span> {filterPerson}</p>
                <p><span className="font-semibold text-stone-400">Priority:</span> {filterPriority}</p>
                <p><span className="font-semibold text-stone-400">Category:</span> {filterCategory}</p>
                <p><span className="font-semibold text-stone-400">Status:</span> {filterStatus}</p>
              </div>
              <div className="flex justify-center gap-3 pt-2">
                <Button variant="outline" onClick={() => setIsDeleteFilteredOpen(false)}>Cancel</Button>
                <Button
                  onClick={() => {
                    const filters = {
                      search: searchQuery || undefined,
                      assignedTo: filterPerson !== "All" ? filterPerson : undefined,
                      priority: filterPriority !== "All" ? filterPriority : undefined,
                      category: filterCategory !== "All" ? filterCategory : undefined,
                      status: filterStatus !== "All" ? filterStatus : undefined
                    };
                    deleteFilteredMutation.mutate(filters);
                  }}
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                >
                  Delete Filtered Tasks
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DIALOG: Delete All Tasks Confirmation */}
      <AnimatePresence>
        {isDeleteAllOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/85 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md rounded-lg border bg-card p-6 shadow-2xl text-center space-y-4"
            >
              <h3 className="font-bold text-lg text-red-500 flex items-center justify-center gap-2">
                <AlertTriangle className="h-5 w-5 animate-pulse" /> Delete All Tasks?
              </h3>
              <p className="text-xs text-stone-300 leading-relaxed">
                You are about to delete ALL tasks from Pronix Digital Work Management.
              </p>
              
              <div className="bg-destructive/10 border border-destructive/20 p-4 rounded text-left text-xs space-y-1.5 text-stone-200">
                <p>This will remove:</p>
                <ul className="list-disc pl-4 space-y-0.5 text-stone-400">
                  <li>All pending tasks</li>
                  <li>All completed tasks</li>
                  <li>All scheduled tasks</li>
                  <li>All AI-generated tasks</li>
                  <li>All manually created tasks</li>
                  <li>All tasks assigned to Parth</li>
                  <li>All tasks assigned to Ronit</li>
                </ul>
                <p className="border-t border-destructive/20 pt-2 font-bold text-red-400">
                  Total tasks: {(statsData?.stats?.totalActive ?? 0) + (statsData?.stats?.totalDeleted ?? 0)}
                </p>
              </div>

              <p className="text-xs font-bold text-red-500 uppercase tracking-wider">
                This action cannot be undone. Are you sure?
              </p>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-stone-300">
                  Type <span className="font-mono text-white bg-muted px-1.5 py-0.5 rounded">DELETE ALL</span> to confirm:
                </label>
                <input
                  type="text"
                  placeholder="DELETE ALL"
                  value={deleteAllConfirmText}
                  onChange={(e) => setDeleteAllConfirmText(e.target.value)}
                  className="w-full h-9 rounded bg-background border px-3 text-xs focus:outline-none focus:ring-1 focus:ring-red-500 text-center font-bold tracking-widest uppercase"
                />
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <Button variant="outline" onClick={() => { setIsDeleteAllOpen(false); setDeleteAllConfirmText(""); }}>Cancel</Button>
                <Button
                  disabled={deleteAllConfirmText.trim().toUpperCase() !== "DELETE ALL" || deleteAllMutation.isPending}
                  onClick={() => deleteAllMutation.mutate(deleteAllConfirmText.trim().toUpperCase())}
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground disabled:opacity-40"
                >
                  {deleteAllMutation.isPending ? "Deleting Everything..." : "Delete Everything"}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
