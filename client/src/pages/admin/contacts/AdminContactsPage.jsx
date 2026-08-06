import { useEffect, useState, useRef } from "react";
import {
  CheckCheck,
  Eye,
  Trash2,
  Search,
  Filter,
  Download,
  Calendar,
  DollarSign,
  Briefcase,
  Layers,
  Inbox,
  User,
  Building,
  Mail as MailIcon,
  Phone as PhoneIcon,
  MessageSquare,
  ChevronDown,
  X,
  FileSpreadsheet,
  FileText,
  Clock,
  TrendingUp,
  AlertCircle,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { m as motion, AnimatePresence } from "framer-motion";
import {
  useContacts,
  useContact,
  useDeleteContact,
  useUpdateContactStatus,
  useUpdateContactNotes,
  useBulkDeleteContacts,
  useBulkUpdateContactsStatus,
  useContactAnalytics,
} from "@/features/contacts/useContacts";
import { useToast } from "@/providers/ToastProvider";
import { useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS = [
  { value: "new", label: "New", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  { value: "contacted", label: "Contacted", color: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
  { value: "in-progress", label: "In Progress", color: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  { value: "closed", label: "Closed", color: "bg-green-500/10 text-green-600 border-green-500/20" },
  { value: "spam", label: "Spam", color: "bg-red-500/10 text-red-600 border-red-500/20" },
];

const BUDGET_OPTIONS = [
  { value: "< $5k", label: "< $5k" },
  { value: "$5k - $10k", label: "$5k - $10k" },
  { value: "$10k - $25k", label: "$10k - $25k" },
  { value: "$25k+", label: "$25k+" },
];

const SERVICE_OPTIONS = [
  { value: "Custom Web Development", label: "Web Development" },
  { value: "Mobile Application Development", label: "Mobile Apps" },
  { value: "Full Stack Development", label: "Full Stack" },
  { value: "Artificial Intelligence Solutions", label: "AI Solutions" },
  { value: "Cloud & Backend Development", label: "Cloud & DevOps" },
  { value: "UI/UX Design", label: "UI/UX Design" },
  { value: "Startup Product Development", label: "Startup MVP" },
  { value: "Maintenance & Support", label: "Support" },
];

const DATE_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "this-week", label: "This Week" },
  { value: "this-month", label: "This Month" },
];

export function AdminContactsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { success, error: showError } = useToast();

  // Query and Filter states
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [budgetFilter, setBudgetFilter] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [sortField, setSortField] = useState("-createdAt");

  // Selection states
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);

  // Popover menus
  const [phoneMenuTarget, setPhoneMenuTarget] = useState(null);
  const phoneMenuRef = useRef(null);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetching contacts
  const params = {
    page,
    limit: 10,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(statusFilter && { status: statusFilter }),
    ...(budgetFilter && { budgetRange: budgetFilter }),
    ...(serviceFilter && { serviceInterest: serviceFilter }),
    ...(dateFilter && { dateFilter }),
    sort: sortField,
  };

  const { data, isLoading } = useContacts(params);
  const { data: analytics, isLoading: analyticsLoading } = useContactAnalytics();

  // Mutations
  const deleteContact = useDeleteContact();
  const updateContactStatus = useUpdateContactStatus();
  const updateContactNotes = useUpdateContactNotes();
  const bulkDeleteContacts = useBulkDeleteContacts();
  const bulkUpdateContactsStatus = useBulkUpdateContactsStatus();

  // Highlight ID from notifications navigate
  const highlightId = searchParams.get("id");
  const { data: highlightedContact } = useContact(highlightId);

  useEffect(() => {
    if (highlightedContact) {
      setSelectedContact(highlightedContact);
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.delete("id");
        return next;
      });
    }
  }, [highlightedContact, setSearchParams]);

  const contacts = data?.items ?? [];
  const meta = data?.meta ?? null;

  // Handle select all
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(contacts.map((c) => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  // Handle single select
  const handleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (phoneMenuRef.current && !phoneMenuRef.current.contains(event.target)) {
        setPhoneMenuTarget(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Quick Action: Status Change
  const handleStatusChange = async (contactId, newStatus) => {
    try {
      await updateContactStatus.mutateAsync({ id: contactId, status: newStatus });
      success("Status updated successfully");
      if (selectedContact?.id === contactId) {
        setSelectedContact((prev) => ({ ...prev, status: newStatus }));
      }
    } catch {
      showError("Failed to update status");
    }
  };

  // Quick Action: Delete
  const handleDeleteContact = async (id) => {
    try {
      await deleteContact.mutateAsync(id);
      success("Contact deleted successfully");
      if (selectedContact?.id === id) {
        setSelectedContact(null);
      }
    } catch {
      showError("Failed to delete contact");
    }
  };

  // Bulk: Delete
  const handleBulkDelete = async () => {
    if (confirm(`Are you sure you want to delete ${selectedIds.length} requests?`)) {
      try {
        await bulkDeleteContacts.mutateAsync(selectedIds);
        success("Selected requests deleted");
        setSelectedIds([]);
      } catch {
        showError("Failed to execute bulk delete");
      }
    }
  };

  // Bulk: Status
  const handleBulkStatus = async (status) => {
    try {
      await bulkUpdateContactsStatus.mutateAsync({ ids: selectedIds, status });
      success(`Selected requests marked as ${status}`);
      setSelectedIds([]);
    } catch {
      showError("Failed to update status in bulk");
    }
  };

  // Export: CSV
  const handleExportCSV = (itemsToExport) => {
    const headers = [
      "Full Name",
      "Email",
      "Phone",
      "Company",
      "Service Interested",
      "Budget",
      "Message",
      "Status",
      "Date",
      "Notes",
    ];
    const rows = itemsToExport.map((item) => [
      `"${item.name.replace(/"/g, '""')}"`,
      `"${item.email}"`,
      `"${item.phone ?? ""}"`,
      `"${(item.company ?? "").replace(/"/g, '""')}"`,
      `"${item.serviceInterest ?? ""}"`,
      `"${item.budgetRange ?? ""}"`,
      `"${item.message.replace(/"/g, '""')}"`,
      `"${item.status}"`,
      `"${new Date(item.createdAt).toLocaleString()}"`,
      `"${(item.notes ?? "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `contacts_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success("CSV export initiated");
  };

  // Export: PDF via clean print layout
  const handleExportPDF = (itemsToExport) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      showError("Popup blocker prevented PDF generation");
      return;
    }

    const htmlContent = `
      <html>
        <head>
          <title>Contact Inquiries Export</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 24px; color: #1c1612; }
            h1 { font-size: 20px; font-weight: bold; margin-bottom: 4px; }
            p.meta { font-size: 11px; color: #666; margin-bottom: 24px; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; }
            th, td { padding: 10px; border-bottom: 1px solid #e8e2d9; text-align: left; font-size: 11px; vertical-align: top; }
            th { background-color: #faf8f5; font-weight: bold; }
            .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; text-transform: uppercase; }
            .status-new { background-color: #e0f2fe; color: #0369a1; }
            .status-contacted { background-color: #ffedd5; color: #c2410c; }
            .status-in-progress { background-color: #f3e8ff; color: #7e22ce; }
            .status-closed { background-color: #dcfce7; color: #15803d; }
          </style>
        </head>
        <body>
          <h1>Pronix Digital – Contact Request Logs</h1>
          <p class="meta">Generated on ${new Date().toLocaleString()} | Count: ${itemsToExport.length} entries</p>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email / Phone</th>
                <th>Company</th>
                <th>Service</th>
                <th>Budget</th>
                <th>Status</th>
                <th>Submitted Date</th>
              </tr>
            </thead>
            <tbody>
              ${itemsToExport
                .map(
                  (item) => `
                <tr>
                  <td><strong>${item.name}</strong></td>
                  <td>${item.email}<br/>${item.phone ?? "-"}</td>
                  <td>${item.company ?? "-"}</td>
                  <td>${item.serviceInterest ?? "-"}</td>
                  <td>${item.budgetRange ?? "-"}</td>
                  <td><span class="badge status-${item.status}">${item.status}</span></td>
                  <td>${new Date(item.createdAt).toLocaleDateString()}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
          <script>
            window.onload = function() {
              window.print();
              window.close();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    success("PDF print dialog opened");
  };

  const handlePhoneClick = (event, contact) => {
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    setPhoneMenuTarget({
      contact,
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
    });
  };

  const getStatusColor = (status) => {
    return STATUS_OPTIONS.find((opt) => opt.value === status)?.color ?? "bg-gray-100 text-gray-700 border-gray-200";
  };

  return (
    <section className="space-y-6">
      {/* 1. Analytics Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {[
          { label: "Total Requests", value: analytics?.total ?? 0, icon: Layers, color: "text-[#3E332B] bg-[#FCFBF9]" },
          { label: "Today's Requests", value: analytics?.today ?? 0, icon: Clock, color: "text-blue-600 bg-blue-50/50" },
          { label: "This Week", value: analytics?.thisWeek ?? 0, icon: Calendar, color: "text-orange-600 bg-orange-50/50" },
          { label: "This Month", value: analytics?.thisMonth ?? 0, icon: FileText, color: "text-indigo-600 bg-indigo-50/50" },
          { label: "Pending", value: analytics?.pending ?? 0, icon: AlertCircle, color: "text-purple-600 bg-purple-50/50" },
          { label: "Completed", value: analytics?.completed ?? 0, icon: CheckCheck, color: "text-green-600 bg-green-50/50" },
          { label: "Conversion Rate", value: `${analytics?.conversionRate ?? 0}%`, icon: TrendingUp, color: "text-emerald-600 bg-emerald-50/50" },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={cn(
                "p-4 rounded-xl border border-border shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between h-[100px]",
                card.color
              )}
            >
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground">{card.label}</span>
                <Icon className="h-4 w-4 opacity-75" />
              </div>
              {analyticsLoading ? (
                <div className="h-6 w-12 rounded bg-muted animate-pulse" />
              ) : (
                <span className="text-xl font-bold font-display tracking-tight text-foreground">{card.value}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight">Contact Requests</h1>
          <p className="text-sm text-muted-foreground">Manage website form leads, notes, and communications.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-[#C5B39C] text-[#3E332B] hover:bg-[#F5EFE6]"
            onClick={() => handleExportCSV(contacts)}
            disabled={contacts.length === 0}
          >
            <Download className="h-3.5 w-3.5 mr-1" /> Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-[#C5B39C] text-[#3E332B] hover:bg-[#F5EFE6]"
            onClick={() => handleExportPDF(contacts)}
            disabled={contacts.length === 0}
          >
            <FileText className="h-3.5 w-3.5 mr-1" /> Export PDF
          </Button>
        </div>
      </div>

      {/* 2. Filters & Search Controls */}
      <div className="p-4 rounded-2xl border border-border bg-[#FCFBF9] flex flex-col gap-4 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, email, phone, company, service..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm outline-none transition-all placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Quick Clear filters */}
          {(statusFilter || budgetFilter || serviceFilter || dateFilter || sortField !== "-createdAt") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setStatusFilter("");
                setBudgetFilter("");
                setServiceFilter("");
                setDateFilter("");
                setSortField("-createdAt");
              }}
              className="text-xs text-destructive hover:bg-destructive/5 self-start lg:self-center h-10 px-4 rounded-xl border border-destructive/10"
            >
              Reset Filters
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {/* Status filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <Filter className="h-3 w-3" /> Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="h-9 w-full rounded-xl border border-border bg-white px-3 text-xs outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            >
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Service filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <Briefcase className="h-3 w-3" /> Service
            </label>
            <select
              value={serviceFilter}
              onChange={(e) => {
                setServiceFilter(e.target.value);
                setPage(1);
              }}
              className="h-9 w-full rounded-xl border border-border bg-white px-3 text-xs outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            >
              <option value="">All Services</option>
              {SERVICE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Budget filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <DollarSign className="h-3 w-3" /> Budget
            </label>
            <select
              value={budgetFilter}
              onChange={(e) => {
                setBudgetFilter(e.target.value);
                setPage(1);
              }}
              className="h-9 w-full rounded-xl border border-border bg-white px-3 text-xs outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            >
              <option value="">All Budgets</option>
              {BUDGET_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date range filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Date Range
            </label>
            <select
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setPage(1);
              }}
              className="h-9 w-full rounded-xl border border-border bg-white px-3 text-xs outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            >
              <option value="">Any Time</option>
              {DATE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sorting */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" /> Sorting
            </label>
            <select
              value={sortField}
              onChange={(e) => {
                setSortField(e.target.value);
                setPage(1);
              }}
              className="h-9 w-full rounded-xl border border-border bg-white px-3 text-xs outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            >
              <option value="-createdAt">Newest First</option>
              <option value="createdAt">Oldest First</option>
              <option value="name">Name (A-Z)</option>
              <option value="-name">Name (Z-A)</option>
              <option value="company">Company (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Bulk Floating Actions Toolbar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-zinc-900 border border-zinc-800 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-4 max-w-[90vw] md:max-w-lg"
          >
            <span className="text-xs font-bold text-zinc-400 bg-zinc-800 px-2.5 py-1 rounded-md shrink-0">
              {selectedIds.length} selected
            </span>

            <div className="h-4 w-[1px] bg-zinc-800" />

            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleBulkStatus("contacted")}
                className="text-xs h-8 text-orange-400 hover:bg-zinc-800 px-2 rounded-lg"
              >
                Mark Contacted
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleBulkStatus("closed")}
                className="text-xs h-8 text-green-400 hover:bg-zinc-800 px-2 rounded-lg"
              >
                Mark Closed
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleExportCSV(contacts.filter((c) => selectedIds.includes(c.id)))}
                className="text-xs h-8 text-zinc-300 hover:bg-zinc-800 px-2 rounded-lg"
              >
                CSV
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleExportPDF(contacts.filter((c) => selectedIds.includes(c.id)))}
                className="text-xs h-8 text-zinc-300 hover:bg-zinc-800 px-2 rounded-lg"
              >
                PDF
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBulkDelete}
                className="text-xs h-8 text-red-400 hover:bg-zinc-800 px-2 rounded-lg"
              >
                Delete
              </Button>
            </div>

            <button
              onClick={() => setSelectedIds([])}
              className="text-zinc-500 hover:text-white ml-2 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Table UI */}
      <div className="rounded-2xl border border-border bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin max-h-[500px]">
          <table className="w-full text-sm text-left border-collapse relative">
            <thead className="sticky top-0 bg-[#FCFBF9] border-b border-border z-10">
              <tr>
                <th className="p-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={contacts.length > 0 && selectedIds.length === contacts.length}
                    onChange={handleSelectAll}
                    className="rounded border-border text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Name
                </th>
                <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Company
                </th>
                <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Email & Phone
                </th>
                <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Service
                </th>
                <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Budget
                </th>
                <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground w-32">
                  Status
                </th>
                <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground w-28">
                  Date
                </th>
                <th className="px-4 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground w-24">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="hover:bg-muted/5 transition-colors">
                    <td className="p-4"><div className="h-4 w-4 rounded bg-muted animate-pulse mx-auto" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-28 rounded bg-muted animate-pulse" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-24 rounded bg-muted/80 animate-pulse" /></td>
                    <td className="px-4 py-4">
                      <div className="h-3 w-36 rounded bg-muted/70 animate-pulse mb-1" />
                      <div className="h-3.5 w-24 rounded bg-muted/50 animate-pulse" />
                    </td>
                    <td className="px-4 py-4"><div className="h-4 w-32 rounded bg-muted/80 animate-pulse" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-16 rounded bg-muted/80 animate-pulse" /></td>
                    <td className="px-4 py-4"><div className="h-6 w-20 rounded bg-muted animate-pulse" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-16 rounded bg-muted/85 animate-pulse" /></td>
                    <td className="px-4 py-4"><div className="h-8 w-12 rounded bg-muted animate-pulse ml-auto" /></td>
                  </tr>
                ))
              ) : contacts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12">
                    <div className="flex flex-col items-center justify-center text-center">
                      <Inbox className="h-12 w-12 text-muted-foreground opacity-30 mb-3" />
                      <p className="font-semibold text-foreground text-sm">No contact requests found</p>
                      <p className="text-xs text-muted-foreground max-w-sm mt-1">
                        {search ? "No requests match your current filters or query." : "You have not received any contact request submissions yet."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                contacts.map((contact, idx) => (
                  <tr
                    key={contact.id}
                    onClick={() => setSelectedContact(contact)}
                    className={cn(
                      "hover:bg-[#FCFBF9] transition-colors cursor-pointer group",
                      idx % 2 === 0 ? "bg-white" : "bg-[#FAF8F5]/30",
                      selectedIds.includes(contact.id) && "bg-[#F5EFE6]/30"
                    )}
                  >
                    <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(contact.id)}
                        onChange={() => handleSelectRow(contact.id)}
                        className="rounded border-border text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-foreground break-normal text-xs sm:text-sm">
                      {contact.name}
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground max-w-[150px] truncate text-xs">
                      {contact.company || "-"}
                    </td>
                    <td className="px-4 py-3.5 text-xs">
                      <div className="text-muted-foreground font-medium group-hover:text-foreground transition-colors">
                        {contact.email}
                      </div>
                      {contact.phone && (
                        <button
                          onClick={(e) => handlePhoneClick(e, contact)}
                          className="text-[10px] font-bold text-primary hover:underline flex items-center gap-0.5 mt-0.5"
                        >
                          <PhoneIcon className="h-2.5 w-2.5 shrink-0" />
                          {contact.phone}
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground max-w-[180px] truncate text-xs">
                      {contact.serviceInterest || "-"}
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground font-mono text-xs">
                      {contact.budgetRange || "-"}
                    </td>
                    <td className="px-4 py-3.5">
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="relative"
                      >
                        <select
                          className={cn(
                            "h-7 rounded-full border text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 outline-none cursor-pointer appearance-none text-center pr-6",
                            getStatusColor(contact.status)
                          )}
                          value={contact.status}
                          onChange={(e) => handleStatusChange(contact.id, e.target.value)}
                        >
                          {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value} className="bg-white text-foreground">
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-2 h-3 w-3 opacity-60 pointer-events-none" />
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground text-xs">
                      {contact.createdAt ? new Date(contact.createdAt).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-[#FAF8F5]"
                          onClick={() => setSelectedContact(contact)}
                          aria-label="View info"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-red-50 hover:text-red-500"
                          onClick={() => {
                            if (confirm(`Delete inquiry from ${contact.name}?`)) {
                              handleDeleteContact(contact.id);
                            }
                          }}
                          aria-label="Delete info"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3.5 bg-[#FCFBF9] z-10">
            <span className="text-xs text-muted-foreground">
              Showing page <strong className="font-semibold text-foreground">{meta.page}</strong> of{" "}
              <strong className="font-semibold text-foreground">{meta.totalPages}</strong> (
              <strong className="font-semibold text-foreground">{meta.total}</strong> results)
            </span>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 rounded-lg"
                disabled={!meta.hasPrevPage}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 rounded-lg"
                disabled={!meta.hasNextPage}
                onClick={() => setPage((p) => Math.min(p + 1, meta.totalPages))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 5. Custom Right Drawer for Details & Notes */}
      <AnimatePresence>
        {selectedContact && (
          <>
            {/* Drawer Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedContact(null)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs"
            />

            {/* Drawer Container */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-lg border-l border-[#E8E2D9] bg-white p-6 shadow-2xl flex flex-col justify-between"
            >
              {/* Header */}
              <div>
                <div className="flex items-center justify-between border-b border-[#E8E2D9] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-base uppercase">
                      {selectedContact.name ? selectedContact.name.charAt(0) : "U"}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#1C1612] truncate">{selectedContact.name}</h3>
                      <p className="text-xs text-muted-foreground truncate">{selectedContact.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedContact(null)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FAF8F5] border border-border hover:bg-accent text-muted-foreground hover:text-foreground transition-all"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto mt-6 space-y-5 py-1 scrollbar-none max-h-[calc(100vh-280px)]">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4 bg-[#FCFBF9] border border-border rounded-2xl p-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Company</span>
                      <span className="text-xs font-semibold text-foreground break-words">{selectedContact.company || "-"}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Requested Service</span>
                      <span className="text-xs font-semibold text-[#5A3728] break-words">{selectedContact.serviceInterest || "-"}</span>
                    </div>
                    <div className="space-y-1 border-t border-border/80 pt-3">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Budget Range</span>
                      <span className="text-xs font-mono font-bold text-primary">{selectedContact.budgetRange || "-"}</span>
                    </div>
                    <div className="space-y-1 border-t border-border/80 pt-3">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Submitted Date</span>
                      <span className="text-xs font-semibold text-foreground">
                        {selectedContact.createdAt ? new Date(selectedContact.createdAt).toLocaleString() : "-"}
                      </span>
                    </div>
                    {selectedContact.phone && (
                      <div className="col-span-2 space-y-1 border-t border-border/80 pt-3">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Phone Contact</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-semibold">{selectedContact.phone}</span>
                          <button
                            onClick={(e) => handlePhoneClick(e, selectedContact)}
                            className="bg-[#FAF8F5] border border-border hover:bg-accent text-primary px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all"
                          >
                            <PhoneIcon className="h-3 w-3" /> Actions
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Message box */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Message Details</label>
                    <p className="rounded-2xl border border-border bg-white p-4 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap text-foreground max-h-[160px] overflow-y-auto">
                      {selectedContact.message}
                    </p>
                  </div>

                  {/* Inline notes text area */}
                  <div className="space-y-1.5 border-t pt-4">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Admin Notes</label>
                    <textarea
                      value={selectedContact.notes ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelectedContact((prev) => ({ ...prev, notes: val }));
                      }}
                      placeholder="Add administrative details, approval status, follow-up callbacks..."
                      className="w-full h-24 rounded-2xl border border-border p-3 text-xs outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-muted-foreground/60 leading-normal resize-none"
                    />
                    <Button
                      size="sm"
                      onClick={() =>
                        updateContactNotes
                          .mutateAsync({ id: selectedContact.id, notes: selectedContact.notes ?? "" })
                          .then(() => success("Notes saved successfully"))
                          .catch(() => showError("Failed to update notes"))
                      }
                      disabled={updateContactNotes.isPending}
                      className="rounded-full h-8 text-[11px] font-semibold bg-primary hover:bg-[#5A3728] mt-1 shrink-0"
                    >
                      {updateContactNotes.isPending ? "Saving notes..." : "Save Notes"}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Bottom Quick actions in drawer */}
              <div className="border-t border-[#E8E2D9] pt-4 mt-auto flex items-center gap-3">
                <select
                  value={selectedContact.status}
                  onChange={(e) => handleStatusChange(selectedContact.id, e.target.value)}
                  className="h-9 flex-1 rounded-xl border border-border px-3 text-xs outline-none bg-background cursor-pointer"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      Mark as: {opt.label}
                    </option>
                  ))}
                </select>

                <Button
                  variant="destructive"
                  size="sm"
                  className="rounded-xl h-9 text-xs px-4"
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete inquiry from ${selectedContact.name}?`)) {
                      handleDeleteContact(selectedContact.id);
                    }
                  }}
                >
                  Delete Lead
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 6. Clickable Phone Action Popup Menu */}
      <AnimatePresence>
        {phoneMenuTarget && (
          <div
            ref={phoneMenuRef}
            style={{
              position: "absolute",
              top: `${phoneMenuTarget.top + 4}px`,
              left: `${phoneMenuTarget.left}px`,
            }}
            className="z-50 w-44 rounded-xl border border-[#E8E2D9] bg-white p-1.5 shadow-lg flex flex-col text-left"
          >
            <p className="text-[10px] font-bold text-muted-foreground px-2 py-1 uppercase border-b border-border mb-1.5">
              Contact Options
            </p>
            {/* Call Action */}
            <a
              href={`tel:${phoneMenuTarget.contact.phone.replace(/[^+\d]/g, "")}`}
              className="flex items-center gap-2.5 px-2.5 py-1.5 hover:bg-[#FAF8F5] rounded-lg text-xs font-semibold text-[#1C1612] transition-colors"
              onClick={() => setPhoneMenuTarget(null)}
            >
              <PhoneIcon className="h-3.5 w-3.5 text-blue-500" />
              📞 Call
            </a>
            {/* WhatsApp Link with Pre-filled message */}
            <a
              href={`https://wa.me/${phoneMenuTarget.contact.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                `Hello ${phoneMenuTarget.contact.name},\n\nI am from Pronix Digital. Thank you for contacting us.\n\nHow can I help you today?`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-2.5 py-1.5 hover:bg-[#FAF8F5] rounded-lg text-xs font-semibold text-[#1C1612] transition-colors"
              onClick={() => setPhoneMenuTarget(null)}
            >
              <MessageCircle className="h-3.5 w-3.5 text-green-500" />
              💬 WhatsApp
            </a>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
