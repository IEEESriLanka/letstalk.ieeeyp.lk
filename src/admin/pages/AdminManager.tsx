import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useState } from "react";
import { Check, ShieldCheck, Trash2, UserPlus, X } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "@/admin/components/AdminLayout";
import { useAuth } from "@/hooks/useAuth";
import {
  AdminModal,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  LoadingSkeleton,
  fieldClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "@/admin/components/AdminPrimitives";
import {
  createAdminAccount,
  deleteAdminAccount,
  listAdminAccounts,
  listAccessRequests,
  approveAccessRequest,
  rejectAccessRequest,
  type AdminAccount,
  type AccessRequest,
} from "@/admin/services/admin-data";

export function AdminManagerPage() {
  const { data: access } = useAuth();
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState<"admin" | "editor">("admin");
  const [deleteTarget, setDeleteTarget] = useState<AdminAccount | null>(null);
  const [approveTarget, setApproveTarget] = useState<AccessRequest | null>(null);
  const [approvalUserId, setApprovalUserId] = useState("");
  const [approvalRole, setApprovalRole] = useState<"admin" | "editor">("editor");

  const canManage = access?.ok === true && access.admin.role === "admin";
  const admins = useQuery({
    queryKey: ["admin-accounts"],
    queryFn: listAdminAccounts,
    enabled: canManage,
  });
  const requests = useQuery({
    queryKey: ["admin-access-requests"],
    queryFn: listAccessRequests,
    enabled: canManage,
  });

  if (access?.ok && access.admin.role !== "admin") {
    return (
      <AdminLayout title="Admin Manager" subtitle="Manage CMS access.">
        <ErrorState message="Only administrators can manage CMS access." />
      </AdminLayout>
    );
  }

  const create = useMutation({
    mutationFn: () => createAdminAccount({ user_id: userId, role }),
    onSuccess: () => {
      toast.success("Admin account created.");
      setUserId("");
      setRole("admin");
      void queryClient.invalidateQueries({ queryKey: ["admin-accounts"] });
    },
    onError: (error) => toast.error(error.message),
  });

  const approve = useMutation({
    mutationFn: () =>
      approveAccessRequest({ requestId: approveTarget!.id, userId: approvalUserId, role: approvalRole }),
    onSuccess: () => {
      toast.success("Access request approved.");
      setApproveTarget(null);
      setApprovalUserId("");
      void queryClient.invalidateQueries({ queryKey: ["admin-accounts"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-access-requests"] });
    },
    onError: (error) => toast.error(error.message),
  });

  const reject = useMutation({
    mutationFn: rejectAccessRequest,
    onSuccess: () => {
      toast.success("Access request rejected.");
      void queryClient.invalidateQueries({ queryKey: ["admin-access-requests"] });
    },
    onError: (error) => toast.error(error.message),
  });

  const remove = useMutation({
    mutationFn: deleteAdminAccount,
    onSuccess: () => {
      toast.success("Admin account deleted.");
      setDeleteTarget(null);
      void queryClient.invalidateQueries({ queryKey: ["admin-accounts"] });
    },
    onError: (error) => toast.error(error.message),
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!userId.trim()) {
      toast.error("Supabase Auth user ID is required.");
      return;
    }
    create.mutate();
  }

  return (
    <AdminLayout title="Admin Manager" subtitle="Create and manage CMS login accounts.">
      <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-md bg-[#00629b]/10 text-[#00629b]">
              <UserPlus className="size-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-950">Add Admin</h2>
              <p className="text-sm text-slate-500">Grant CMS access to an existing Supabase Auth user.</p>
            </div>
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Supabase Auth user ID</span>
              <input
                value={userId}
                onChange={(event) => setUserId(event.target.value)}
                className={`${fieldClass} mt-1.5`}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                required
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Role</span>
              <select
                value={role}
                onChange={(event) => setRole(event.target.value as "admin" | "editor")}
                className={`${fieldClass} mt-1.5`}
              >
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
              </select>
            </label>
            <button type="submit" disabled={create.isPending} className={primaryButtonClass}>
              <UserPlus className="size-4" />
              {create.isPending ? "Adding..." : "Add Admin"}
            </button>
          </form>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-950">Admin Accounts</h2>
            <p className="mt-1 text-sm text-slate-500">Current people who can access the CMS.</p>
          </div>

          {admins.isLoading ? <LoadingSkeleton /> : null}
          {admins.isError ? (
            <ErrorState message="Unable to load admin accounts." onRetry={() => admins.refetch()} />
          ) : null}
          {admins.data?.length === 0 ? <EmptyState title="No admin accounts found." /> : null}
          {admins.data && admins.data.length > 0 ? (
            <div className="divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200">
              {admins.data.map((admin) => (
                <article
                  key={admin.id}
                  className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-md bg-slate-100 text-[#00629b]">
                      <ShieldCheck className="size-5" />
                    </span>
                    <div>
                      <p className="font-semibold text-slate-950">{admin.user_id}</p>
                      <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                        {admin.role} / Added {new Date(admin.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(admin)}
                    className={secondaryButtonClass}
                  >
                    <Trash2 className="size-4" />
                    Delete
                  </button>
                </article>
              ))}
            </div>
          ) : null}
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-bold text-slate-950">Access Requests</h2>
          <p className="mt-1 text-sm text-slate-500">
            Review requests submitted from the admin login page. The applicant must provide their
            Supabase Auth user ID before approval.
          </p>
          {requests.isLoading ? <LoadingSkeleton /> : null}
          {requests.data?.filter((request) => request.status === "pending").length === 0 ? (
            <EmptyState title="No pending access requests." />
          ) : null}
          <div className="mt-4 divide-y divide-slate-100 rounded-lg border border-slate-200">
            {requests.data?.filter((request) => request.status === "pending").map((request) => (
              <article key={request.id} className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="font-semibold text-slate-950">{request.full_name}</p>
                  <p className="text-sm text-[#00629b]">{request.email}</p>
                  <p className="mt-2 text-sm text-slate-600">{request.reason}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    className={primaryButtonClass}
                    onClick={() => {
                      setApproveTarget(request);
                      setApprovalUserId(request.user_id ?? "");
                    }}
                  >
                    <Check className="size-4" /> Approve
                  </button>
                  <button type="button" className={secondaryButtonClass} onClick={() => reject.mutate(request.id)}>
                    <X className="size-4" /> Reject
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete admin account?"
        description="This removes the CMS login for this account. You cannot delete your own account."
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && remove.mutate(deleteTarget.id)}
      />
      <AdminModal
        open={Boolean(approveTarget)}
        title="Approve access request"
        onClose={() => setApproveTarget(null)}
      >
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            approve.mutate();
          }}
        >
          <p className="text-sm text-slate-600">
            Add the Supabase Auth user ID for {approveTarget?.email} to grant CMS access.
          </p>
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Supabase Auth user ID</span>
            <input
              value={approvalUserId}
              onChange={(event) => setApprovalUserId(event.target.value)}
              className={`${fieldClass} mt-1.5`}
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Role</span>
            <select
              value={approvalRole}
              onChange={(event) => setApprovalRole(event.target.value as "admin" | "editor")}
              className={`${fieldClass} mt-1.5`}
            >
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <button type="submit" disabled={approve.isPending} className={primaryButtonClass}>
            {approve.isPending ? "Approving..." : "Approve access"}
          </button>
        </form>
      </AdminModal>
    </AdminLayout>
  );
}
