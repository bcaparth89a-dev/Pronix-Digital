import { useState, useEffect } from "react";
import {
  Globe,
  Smartphone,
  Code2,
  TrendingUp,
  Layers,
  Cpu,
  Shield,
  Sparkles,
  Server,
  Database,
  Cloud,
  Terminal,
  Lock,
  Zap,
  BarChart3,
  Activity,
  Users,
  Settings,
  Laptop,
  Heart,
  Lightbulb,
  Briefcase,
  Plus,
  Trash2,
  Save,
  AlertCircle,
  HelpCircle,
  Loader2,
} from "lucide-react";

const Icons = {
  Globe,
  Smartphone,
  Code2,
  TrendingUp,
  Layers,
  Cpu,
  Shield,
  Sparkles,
  Server,
  Database,
  Cloud,
  Terminal,
  Lock,
  Zap,
  BarChart3,
  Activity,
  Users,
  Settings,
  Laptop,
  Heart,
  Lightbulb,
  Briefcase,
  Plus,
  Trash2,
  Save,
  AlertCircle,
  HelpCircle,
};
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/PageHeader";
import { useToast } from "@/providers/ToastProvider";
import {
  useMetrics,
  useCreateMetric,
  useUpdateMetric,
  useDeleteMetric,
} from "@/features/metrics/useMetrics";
import {
  useServices,
  useCreateService,
  useUpdateService,
  useDeleteService,
} from "@/features/services/useServices";

const AVAILABLE_ICONS = [
  "Globe",
  "Smartphone",
  "Code2",
  "TrendingUp",
  "Layers",
  "Cpu",
  "Shield",
  "Sparkles",
  "Server",
  "Database",
  "Cloud",
  "Terminal",
  "Lock",
  "Zap",
  "BarChart3",
  "Activity",
  "Users",
  "Settings",
  "Laptop",
  "Heart",
  "Lightbulb",
  "Briefcase",
];

function MetricRow({ metric, onUpdate, onDelete, isPending }) {
  const [value, setValue] = useState(metric.value);
  const [label, setLabel] = useState(metric.label);
  const [order, setOrder] = useState(metric.order);

  useEffect(() => {
    setValue(metric.value);
    setLabel(metric.label);
    setOrder(metric.order);
  }, [metric]);

  const hasChanges =
    value !== metric.value || label !== metric.label || Number(order) !== metric.order;

  return (
    <tr className="border-b last:border-0 hover:bg-muted/30 transition-colors">
      <td className="px-4 py-3">
        <input
          type="text"
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="e.g. 20+"
        />
      </td>
      <td className="px-4 py-3">
        <input
          type="text"
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g. Projects Delivered"
        />
      </td>
      <td className="px-4 py-3 w-24">
        <input
          type="number"
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm outline-none transition-colors focus-visible:ring-1 focus-visible:ring-ring"
          value={order}
          onChange={(e) => setOrder(e.target.value)}
          min="0"
        />
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex justify-end items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1.5"
            onClick={() => onUpdate(metric.id, { value, label, order: Number(order) })}
            disabled={isPending || !hasChanges || !value.trim() || !label.trim()}
          >
            <Save className="h-3.5 w-3.5" />
            Save
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => onDelete(metric.id)}
            disabled={isPending}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

function ServiceRow({ service, onUpdate, onDelete, isPending }) {
  const [icon, setIcon] = useState(service.icon);
  const [title, setTitle] = useState(service.title);
  const [description, setDescription] = useState(service.description);
  const [longDescription, setLongDescription] = useState(service.longDescription || "");
  const [order, setOrder] = useState(service.order);

  useEffect(() => {
    setIcon(service.icon);
    setTitle(service.title);
    setDescription(service.description);
    setLongDescription(service.longDescription || "");
    setOrder(service.order);
  }, [service]);

  const hasChanges =
    icon !== service.icon ||
    title !== service.title ||
    description !== service.description ||
    longDescription !== (service.longDescription || "") ||
    Number(order) !== service.order;

  const IconComponent = Icons[icon] || Icons.HelpCircle;

  return (
    <tr className="border-b last:border-0 hover:bg-muted/30 transition-colors">
      <td className="px-4 py-3 min-w-[150px]">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-primary border border-border">
            <IconComponent className="h-4 w-4" />
          </div>
          <select
            className="flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-sm outline-none transition-colors focus-visible:ring-1 focus-visible:ring-ring"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
          >
            {AVAILABLE_ICONS.map((ico) => (
              <option key={ico} value={ico}>
                {ico}
              </option>
            ))}
          </select>
        </div>
      </td>
      <td className="px-4 py-3">
        <input
          type="text"
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Service Title"
        />
      </td>
      <td className="px-4 py-3">
        <textarea
          rows={2}
          className="flex min-h-[48px] w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring resize-y"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Service description..."
        />
      </td>
      <td className="px-4 py-3">
        <textarea
          rows={2}
          className="flex min-h-[48px] w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring resize-y"
          value={longDescription}
          onChange={(e) => setLongDescription(e.target.value)}
          placeholder="Detailed service explanation..."
        />
      </td>
      <td className="px-4 py-3 w-24">
        <input
          type="number"
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm outline-none transition-colors focus-visible:ring-1 focus-visible:ring-ring"
          value={order}
          onChange={(e) => setOrder(e.target.value)}
          min="0"
        />
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex justify-end items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1.5"
            onClick={() => onUpdate(service.id, { icon, title, description, longDescription, order: Number(order) })}
            disabled={isPending || !hasChanges || !title.trim() || !description.trim()}
          >
            <Save className="h-3.5 w-3.5" />
            Save
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => onDelete(service.id)}
            disabled={isPending}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}



export function AdminSettingsPage() {
  const { success, error: showError } = useToast();
  const [activeTab, setActiveTab] = useState("metrics");



  // Metrics Hooks
  const { data: metricsData, isLoading: isLoadingMetrics } = useMetrics({ isActive: true });
  const createMetric = useCreateMetric();
  const updateMetric = useUpdateMetric();
  const deleteMetric = useDeleteMetric();

  // Metrics Form State
  const [newValue, setNewValue] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [newOrder, setNewOrder] = useState(0);

  const metrics = metricsData?.items ?? [];

  // Services Hooks
  const { data: servicesData, isLoading: isLoadingServices } = useServices();
  const createService = useCreateService();
  const updateService = useUpdateService();
  const deleteService = useDeleteService();

  // Services Form State
  const [newIcon, setNewIcon] = useState("Globe");
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newLongDescription, setNewLongDescription] = useState("");
  const [newOrderService, setNewOrderService] = useState(0);

  const services = servicesData?.items ?? [];



  // Metrics Handlers
  async function handleCreateMetric(e) {
    e.preventDefault();
    if (!newValue.trim() || !newLabel.trim()) return;

    try {
      await createMetric.mutateAsync({
        value: newValue.trim(),
        label: newLabel.trim(),
        order: Number(newOrder),
        isActive: true,
      });
      success("Metric added successfully!");
      setNewValue("");
      setNewLabel("");
      setNewOrder(0);
    } catch {
      showError("Failed to add metric");
    }
  }

  async function handleUpdateMetric(id, payload) {
    try {
      await updateMetric.mutateAsync({ id, payload });
      success("Metric updated successfully!");
    } catch {
      showError("Failed to update metric");
    }
  }

  async function handleDeleteMetric(id) {
    if (!confirm("Are you sure you want to delete this metric?")) return;
    try {
      await deleteMetric.mutateAsync(id);
      success("Metric deleted successfully!");
    } catch {
      showError("Failed to delete metric");
    }
  }

  // Services Handlers
  async function handleCreateService(e) {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) return;

    try {
      await createService.mutateAsync({
        icon: newIcon,
        title: newTitle.trim(),
        description: newDescription.trim(),
        longDescription: newLongDescription.trim(),
        order: Number(newOrderService),
        isActive: true,
      });
      success("Service added successfully!");
      setNewIcon("Globe");
      setNewTitle("");
      setNewDescription("");
      setNewLongDescription("");
      setNewOrderService(0);
    } catch {
      showError("Failed to add service");
    }
  }

  async function handleUpdateService(id, payload) {
    try {
      await updateService.mutateAsync({ id, payload });
      success("Service updated successfully!");
    } catch {
      showError("Failed to update service");
    }
  }

  async function handleDeleteService(id) {
    if (!confirm("Are you sure you want to delete this service?")) return;
    try {
      await deleteService.mutateAsync(id);
      success("Service deleted successfully!");
    } catch {
      showError("Failed to delete service");
    }
  }



  return (
    <section className="space-y-6">
      <PageHeader
        title="Settings"
        description="Configure dynamic website metrics, services, and homepage parameters."
      />

      {/* Tabs Header */}
      <div className="border-b border-border">
        <nav className="flex space-x-6" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("metrics")}
            className={`pb-4 text-sm font-semibold border-b-2 transition-all px-1 ${
              activeTab === "metrics"
                ? "border-primary text-primary font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
            }`}
          >
            Metrics Configuration
          </button>
          <button
            onClick={() => setActiveTab("services")}
            className={`pb-4 text-sm font-semibold border-b-2 transition-all px-1 ${
              activeTab === "services"
                ? "border-primary text-primary font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
            }`}
          >
            Services Configuration
          </button>


        </nav>
      </div>

      {activeTab === "metrics" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Metric list - 2/3 width */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-lg border bg-card p-6">
              <h2 className="text-base font-semibold mb-4 text-foreground">Homepage Metrics</h2>

              {isLoadingMetrics ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-10 w-full animate-pulse rounded bg-muted/50" />
                  ))}
                </div>
              ) : metrics.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground border border-dashed rounded-lg">
                  <AlertCircle className="h-6 w-6 mb-2 text-muted-foreground/60" />
                  <p className="text-sm font-medium">No metrics found</p>
                  <p className="text-xs">Add a new metric on the right to get started.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b bg-muted/40">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Value
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Label
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground w-24">
                          Order
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.map((metric) => (
                        <MetricRow
                          key={metric.id}
                          metric={metric}
                          onUpdate={handleUpdateMetric}
                          onDelete={handleDeleteMetric}
                          isPending={updateMetric.isPending || deleteMetric.isPending}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Add new metric - 1/3 width */}
          <div className="rounded-lg border bg-card p-6 h-fit space-y-4">
            <h2 className="text-base font-semibold text-foreground">Add New Metric Card</h2>

            <form onSubmit={handleCreateMetric} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground" htmlFor="val">
                  Value (e.g. 20+ or 100%)
                </label>
                <input
                  id="val"
                  type="text"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="20+"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground" htmlFor="lbl">
                  Label (e.g. Projects Delivered)
                </label>
                <input
                  id="lbl"
                  type="text"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="Projects Delivered"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground" htmlFor="ord">
                  Display Order
                </label>
                <input
                  id="ord"
                  type="number"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-1 focus-visible:ring-ring"
                  min="0"
                  value={newOrder}
                  onChange={(e) => setNewOrder(e.target.value)}
                />
              </div>

              <Button
                type="submit"
                className="w-full gap-2"
                disabled={createMetric.isPending || !newValue.trim() || !newLabel.trim()}
              >
                <Plus className="h-4 w-4" />
                Add Metric Card
              </Button>
            </form>
          </div>
        </div>
      )}

      {activeTab === "services" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Services list - 2/3 width */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-lg border bg-card p-6">
              <h2 className="text-base font-semibold mb-4 text-foreground">Homepage Services</h2>

              {isLoadingServices ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-10 w-full animate-pulse rounded bg-muted/50" />
                  ))}
                </div>
              ) : services.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground border border-dashed rounded-lg">
                  <AlertCircle className="h-6 w-6 mb-2 text-muted-foreground/60" />
                  <p className="text-sm font-medium">No services found</p>
                  <p className="text-xs">Add a new service on the right to get started.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b bg-muted/40">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground min-w-[150px]">
                          Icon
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Title
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Description
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Long Description
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground w-24">
                          Order
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {services.map((service) => (
                        <ServiceRow
                          key={service.id}
                          service={service}
                          onUpdate={handleUpdateService}
                          onDelete={handleDeleteService}
                          isPending={updateService.isPending || deleteService.isPending}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Add new service - 1/3 width */}
          <div className="rounded-lg border bg-card p-6 h-fit space-y-4">
            <h2 className="text-base font-semibold text-foreground">Add New Service Card</h2>

            <form onSubmit={handleCreateService} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground" htmlFor="new-icon">
                  Select Icon
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-primary border">
                    {(() => {
                      const NewIconComp = Icons[newIcon] || Icons.HelpCircle;
                      return <NewIconComp className="h-5 w-5" />;
                    })()}
                  </div>
                  <select
                    id="new-icon"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-1 focus-visible:ring-ring"
                    value={newIcon}
                    onChange={(e) => setNewIcon(e.target.value)}
                    required
                  >
                    {AVAILABLE_ICONS.map((ico) => (
                      <option key={ico} value={ico}>
                        {ico}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground" htmlFor="new-title">
                  Service Title
                </label>
                <input
                  id="new-title"
                  type="text"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="e.g. Custom Software"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground" htmlFor="new-desc">
                  Description
                </label>
                <textarea
                  id="new-desc"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-1 focus-visible:ring-ring resize-y"
                  placeholder="e.g. Bespoke internal systems, API ecosystems..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground" htmlFor="new-long-desc">
                  Long Description
                </label>
                <textarea
                  id="new-long-desc"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-1 focus-visible:ring-ring resize-y"
                  placeholder="e.g. Detailed explanation, case studies, technologies..."
                  value={newLongDescription}
                  onChange={(e) => setNewLongDescription(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground" htmlFor="new-order">
                  Display Order
                </label>
                <input
                  id="new-order"
                  type="number"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-1 focus-visible:ring-ring"
                  min="0"
                  value={newOrderService}
                  onChange={(e) => setNewOrderService(e.target.value)}
                />
              </div>

              <Button
                type="submit"
                className="w-full gap-2"
                disabled={createService.isPending || !newTitle.trim() || !newDescription.trim()}
              >
                <Plus className="h-4 w-4" />
                Add Service Card
              </Button>
            </form>
          </div>
        </div>
      )}



    </section>
  );
}
