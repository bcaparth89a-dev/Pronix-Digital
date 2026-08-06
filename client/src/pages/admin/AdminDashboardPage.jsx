import { useQuery } from "@tanstack/react-query";
import { CircleHelp, FolderKanban, Mail, Newspaper, Users } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { apiClient } from "@/services/apiClient";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { privateRoutes } from "@/config/navigation";

function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => apiClient.get("/stats").then((r) => r.data.data),
    staleTime: 30_000,
  });
}

function StatCard({ icon, label, value, sub }) {
  const Icon = icon;
  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <p className="text-3xl font-bold tracking-tight text-foreground">{value ?? 0}</p>
      <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

function StatCardSkeleton() {
  return <div className="animate-pulse bg-muted rounded-lg h-28" />;
}

function SectionHeader({ title, linkTo, linkLabel }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      {linkTo && (
        <Link
          to={linkTo}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {linkLabel ?? "View all"}
        </Link>
      )}
    </div>
  );
}

function ListSkeleton({ rows = 5 }) {
  return (
    <div className="rounded-lg border bg-card divide-y">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center justify-between px-4 py-3 gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="animate-pulse bg-muted rounded h-3.5 w-36" />
            <div className="animate-pulse bg-muted rounded h-3 w-24" />
          </div>
          <div className="animate-pulse bg-muted rounded h-5 w-16" />
        </div>
      ))}
    </div>
  );
}

export function AdminDashboardPage() {
  const { data: stats, isLoading } = useDashboardStats();
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader title="Dashboard" description="Overview of your Pronix Digital content" />

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              icon={FolderKanban}
              label="Projects"
              value={stats?.projects?.total}
              sub={`${stats?.projects?.published ?? 0} published`}
            />
            <StatCard
              icon={Newspaper}
              label="Blogs"
              value={stats?.blogs?.total}
              sub={`${stats?.blogs?.published ?? 0} published`}
            />
            <StatCard icon={CircleHelp} label="FAQs" value={stats?.faqs?.total} sub="Total FAQs" />
            <StatCard
              icon={Mail}
              label="Contacts"
              value={stats?.contacts?.total}
              sub={`${stats?.contacts?.new ?? 0} new unread`}
            />
            <StatCard
              icon={Users}
              label="Users"
              value={stats?.users?.total}
              sub="Registered accounts"
            />
          </>
        )}
      </div>

      {/* Recent sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Recent Contacts */}
        <div>
          <SectionHeader
            title="Recent Contacts"
            linkTo={privateRoutes.adminContacts}
            linkLabel="View all"
          />
          {isLoading ? (
            <ListSkeleton rows={5} />
          ) : (
            <div className="rounded-lg border bg-card divide-y">
              {stats?.recentContacts?.length > 0 ? (
                stats.recentContacts.slice(0, 5).map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{contact.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{contact.email}</p>
                    </div>
                    <div className="ml-4 flex items-center gap-2 shrink-0">
                      <StatusBadge status={contact.status} />
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {contact.createdAt ? new Date(contact.createdAt).toLocaleDateString() : "-"}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No contacts yet
                </div>
              )}
            </div>
          )}
        </div>

        {/* Latest Blog Posts */}
        <div>
          <SectionHeader
            title="Latest Posts"
            linkTo={privateRoutes.adminBlogs}
            linkLabel="View all"
          />
          {isLoading ? (
            <ListSkeleton rows={5} />
          ) : (
            <div className="rounded-lg border bg-card divide-y">
              {stats?.recentBlogs?.length > 0 ? (
                stats.recentBlogs.slice(0, 5).map((blog) => (
                  <div
                    key={blog.id}
                    className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => navigate(privateRoutes.adminBlogView(blog.id))}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) =>
                      e.key === "Enter" && navigate(privateRoutes.adminBlogView(blog.id))
                    }
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{blog.title}</p>
                      {blog.category && (
                        <p className="text-xs text-muted-foreground truncate">{blog.category}</p>
                      )}
                    </div>
                    <div className="ml-4 flex items-center gap-2 shrink-0">
                      <StatusBadge status={blog.status} />
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString() : "-"}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No blog posts yet
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
