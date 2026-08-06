import { useEffect, useState } from "react";
import { CheckCheck, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Dialog } from "@/components/admin/Dialog";
import { EmptyState } from "@/components/admin/EmptyState";
import { PageHeader } from "@/components/admin/PageHeader";
import { SearchInput } from "@/components/admin/SearchInput";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  useContacts,
  useDeleteContact,
  useUpdateContactStatus,
} from "@/features/contacts/useContacts";
import { useToast } from "@/providers/ToastProvider";
import { useSearchParams } from "react-router-dom";

const COL_COUNT = 7;

const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "in-review", label: "In Review" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "closed", label: "Closed" },
  { value: "spam", label: "Spam" },
];

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

function DetailRow({ label, children }) {
  return (
    <>
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm text-foreground break-words">{children}</dd>
    </>
  );
}

function ContactDetailDialog({ contact, onClose, updateContactStatus, onStatusUpdated }) {
  const [localStatus, setLocalStatus] = useState("new");

  useEffect(() => {
    if (contact) {
      setLocalStatus(contact.status ?? "new");
    }
  }, [contact]);

  if (!contact) return null;

  async function handleStatusUpdate() {
    try {
      await updateContactStatus.mutateAsync({ id: contact.id, status: localStatus });
      onStatusUpdated?.();
    } catch {
      // error handled by caller
    }
  }

  return (
    <Dialog
      open={Boolean(contact)}
      onClose={onClose}
      title={contact.name}
      description={contact.email}
      className="max-w-xl"
    >
      <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
        <DetailRow label="Phone">{contact.phone || "-"}</DetailRow>
        <DetailRow label="Company">{contact.company || "-"}</DetailRow>
        <DetailRow label="Service Interest">
          {contact.serviceInterest || contact.service || "-"}
        </DetailRow>
        <DetailRow label="Budget Range">{contact.budgetRange || contact.budget || "-"}</DetailRow>
        <DetailRow label="Source">{contact.source || "-"}</DetailRow>
        <DetailRow label="Status">
          <StatusBadge status={contact.status} />
        </DetailRow>
        <DetailRow label="Submitted">
          {contact.createdAt ? new Date(contact.createdAt).toLocaleString() : "-"}
        </DetailRow>
      </dl>

      {contact.message && (
        <div className="mt-4 space-y-1.5">
          <p className="text-sm font-medium text-muted-foreground">Message</p>
          <p className="rounded-md border bg-muted/30 p-3 text-sm leading-relaxed whitespace-pre-wrap">
            {contact.message}
          </p>
        </div>
      )}

      {/* Inline status update */}
      <div className="mt-6 flex items-center gap-3 border-t pt-4">
        <select
          className={SELECT_CLS}
          value={localStatus}
          onChange={(e) => setLocalStatus(e.target.value)}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <Button
          size="sm"
          onClick={handleStatusUpdate}
          disabled={updateContactStatus.isPending || localStatus === contact.status}
        >
          {updateContactStatus.isPending ? "Updating..." : "Update"}
        </Button>
      </div>
    </Dialog>
  );
}

function InlineStatusUpdater({ contact, updateContactStatus }) {
  const [localStatus, setLocalStatus] = useState(contact.status ?? "new");
  const { success, error: showError } = useToast();

  useEffect(() => {
    setLocalStatus(contact.status ?? "new");
  }, [contact.status]);

  async function handleStatusUpdate() {
    try {
      await updateContactStatus.mutateAsync({ id: contact.id, status: localStatus });
      success("Status updated");
    } catch {
      showError("Failed to update status");
    }
  }

  return (
    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
      <select
        className="h-8 rounded-full border border-input bg-background px-2.5 py-1 text-xs outline-none focus-visible:ring-1 focus-visible:ring-ring w-28 cursor-pointer"
        value={localStatus}
        onChange={(e) => setLocalStatus(e.target.value)}
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <Button
        size="sm"
        className="h-8 text-[11px] px-2.5 rounded-full"
        onClick={handleStatusUpdate}
        disabled={updateContactStatus.isPending || localStatus === contact.status}
      >
        {updateContactStatus.isPending ? "..." : "Update"}
      </Button>
    </div>
  );
}

export function AdminContactsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { success, error: showError } = useToast();

  const params = { page, limit: 10, ...(search && { search }) };
  const { data, isLoading } = useContacts(params);
  const deleteContact = useDeleteContact();
  const updateContactStatus = useUpdateContactStatus();

  const [searchParams, setSearchParams] = useSearchParams();
  const updateId = searchParams.get("updateId");
  const newStatus = searchParams.get("newStatus");

  useEffect(() => {
    if (updateId && newStatus) {
      updateContactStatus.mutateAsync({ id: updateId, status: newStatus })
        .then(() => {
          success(`Status updated to ${newStatus}`);
          setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.delete("updateId");
            next.delete("newStatus");
            return next;
          });
        })
        .catch(() => {
          showError("Failed to update status from email link");
        });
    }
  }, [updateId, newStatus, updateContactStatus, setSearchParams, success, showError]);

  const contacts = data?.items ?? [];
  const meta = data?.meta ?? null;

  useEffect(() => {
    setPage(1);
  }, [search]);

  async function handleMarkAsRead(contact) {
    try {
      await updateContactStatus.mutateAsync({ id: contact.id, status: "in-review" });
      success("Marked as read");
    } catch {
      showError("Failed to update status");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteContact.mutateAsync(deleteTarget.id);
      success("Contact deleted");
    } catch {
      showError("Failed to delete contact");
    } finally {
      setDeleteTarget(null);
    }
  }

  return (
    <section>
      <PageHeader title="Contacts" description="View and manage contact form submissions." />

      <div className="mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search contacts..." />
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
                Company
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Service
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <SkeletonRows />
            ) : contacts.length === 0 ? (
              <tr>
                <td colSpan={COL_COUNT}>
                  <EmptyState
                    message="No contacts found"
                    description={
                      search ? "Try a different search term." : "No form submissions yet."
                    }
                  />
                </td>
              </tr>
            ) : (
              contacts.map((contact) => (
                <tr
                  key={contact.id}
                  className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3 font-medium">{contact.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{contact.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">{contact.company || "-"}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {contact.serviceInterest || contact.service || "-"}
                  </td>
                  <td className="px-4 py-3">
                    <InlineStatusUpdater contact={contact} updateContactStatus={updateContactStatus} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {contact.createdAt ? new Date(contact.createdAt).toLocaleDateString() : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedContact(contact)}
                        aria-label="View contact"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {contact.status === "new" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Mark as read"
                          onClick={() => handleMarkAsRead(contact)}
                          disabled={updateContactStatus.isPending}
                          aria-label="Mark as read"
                        >
                          <CheckCheck className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteTarget(contact)}
                        aria-label="Delete contact"
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

      <ContactDetailDialog
        contact={selectedContact}
        onClose={() => setSelectedContact(null)}
        updateContactStatus={updateContactStatus}
        onStatusUpdated={() => success("Contact status updated")}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Contact"
        description={`Delete "${deleteTarget?.name}"?`}
        loading={deleteContact.isPending}
      />
    </section>
  );
}
