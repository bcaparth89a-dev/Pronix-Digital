import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Dialog } from "@/components/admin/Dialog";
import { EmptyState } from "@/components/admin/EmptyState";
import { PageHeader } from "@/components/admin/PageHeader";
import { SearchInput } from "@/components/admin/SearchInput";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useUsers, useUpdateUser, useDeleteUser } from "@/features/users/useUsers";

const COL_COUNT = 7;

const SELECT_CLS =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring";

function SkeletonRows() {
  return Array.from({ length: 5 }).map((_, i) => (
    <tr key={i} className="border-b last:border-0">
      {Array.from({ length: COL_COUNT }).map((_, j) => (
        <td key={j} className="px-4 py-3">
          <div className="animate-pulse rounded bg-muted/50 h-4 w-full" />
        </td>
      ))}
    </tr>
  ));
}

function EditUserDialog({ user, onClose, updateUser }) {
  const [role, setRole] = useState("user");
  const [isActive, setIsActive] = useState(true);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    if (user) {
      setRole(user.role ?? "user");
      setIsActive(user.isActive ?? true);
      setServerError("");
    }
  }, [user]);

  if (!user) return null;

  async function handleSave() {
    setServerError("");
    try {
      await updateUser.mutateAsync({ id: user.id, payload: { role, isActive } });
      onClose();
    } catch (err) {
      setServerError(err?.message || "Failed to update user.");
    }
  }

  return (
    <Dialog
      open={Boolean(user)}
      onClose={onClose}
      title="Edit User"
      description={user.email}
      className="max-w-sm"
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Role</label>
          <select className={SELECT_CLS} value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Status</label>
          <select
            className={SELECT_CLS}
            value={String(isActive)}
            onChange={(e) => setIsActive(e.target.value === "true")}
          >
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        {serverError && <p className="text-xs text-destructive">{serverError}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={updateUser.isPending}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} disabled={updateUser.isPending}>
            {updateUser.isPending ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}

export function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const params = { page, limit: 10, ...(search && { search }) };
  const { data, isLoading } = useUsers(params);
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const users = data?.items ?? [];
  const meta = data?.meta ?? null;

  useEffect(() => {
    setPage(1);
  }, [search]);

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteUser.mutateAsync(deleteTarget.id);
    } finally {
      setDeleteTarget(null);
    }
  }

  return (
    <section>
      <PageHeader title="Users" description="Manage user accounts and roles." />

      <div className="mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search users..." />
      </div>

      <div className="rounded-lg border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Role
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Last Login
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Created
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <SkeletonRows />
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={COL_COUNT}>
                  <EmptyState
                    message="No users found"
                    description={
                      search ? "Try a different search term." : "No users registered yet."
                    }
                  />
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3 font-medium">{user.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                  <td className="px-4 py-3">
                    <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                      {user.role === "admin" ? "Admin" : "User"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={user.isActive} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : "Never"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditTarget(user)}
                        aria-label="Edit user"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteTarget(user)}
                        aria-label="Delete user"
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

      {meta && (
        <div className="mt-4">
          <AdminPagination meta={meta} page={page} onChange={setPage} />
        </div>
      )}

      <EditUserDialog
        user={editTarget}
        onClose={() => setEditTarget(null)}
        updateUser={updateUser}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete User"
        description={`Delete "${deleteTarget?.name}"?`}
        loading={deleteUser.isPending}
      />
    </section>
  );
}
