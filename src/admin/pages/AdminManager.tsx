import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useState } from "react";
import { ShieldCheck, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "@/admin/components/AdminLayout";
import {
  ConfirmDialog,
  EmptyState,
  ErrorState,
  LoadingSkeleton,
  fieldClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "@/admin/components/AdminPrimitives";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import {
  createAdminAccountSecurely,
  deleteAdminAccountSecurely,
  listAdminAccountsSecurely,
} from "@/lib/admin-account-actions";

type AdminAccount = {
  id: string;
  user_id: string;
  email: string;
  role: "admin" | "editor";
  created_at: string;
  last_sign_in_at: string | null;
  active: boolean;
};

async function withAccessToken() {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.access_token)
    throw new Error("Your session has expired. Please sign in again.");
  return data.session.access_token;
}

export function AdminManagerPage() {
  const { data: access } = useAuth();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "editor">("editor");
  const [deleteTarget, setDeleteTarget] = useState<AdminAccount | null>(null);

  const canManage = access?.ok === true && access.admin.role === "admin";
  const admins = useQuery({
    queryKey: ["admin-accounts"],
    queryFn: async () =>
      listAdminAccountsSecurely({ data: { accessToken: await withAccessToken() } }) as Promise<
        AdminAccount[]
      >,
    enabled: canManage,
  });

  const create = useMutation({
    mutationFn: async () =>
      createAdminAccountSecurely({
        data: { accessToken: await withAccessToken(), email, password, role },
      }),
    onSuccess: () => {
      toast.success("Admin account created.");
      setEmail("");
      setPassword("");
      setRole("editor");
      void queryClient.invalidateQueries({ queryKey: ["admin-accounts"] });
    },
    onError: (error) => toast.error(error.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) =>
      deleteAdminAccountSecurely({ data: { accessToken: await withAccessToken(), id } }),
    onSuccess: () => {
      toast.success("Admin account removed.");
      setDeleteTarget(null);
      void queryClient.invalidateQueries({ queryKey: ["admin-accounts"] });
    },
    onError: (error) => toast.error(error.message),
  });

  if (access?.ok && access.admin.role !== "admin") {
    return (
      <AdminLayout title="Admin Manager" subtitle="Manage CMS access.">
        <ErrorState message="Only administrators can manage CMS access." />
      </AdminLayout>
    );
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    create.mutate();
  }

  return (
    <AdminLayout title="Admin Manager" subtitle="Add accounts and review current CMS access.">
      <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-md bg-[#00629b]/10 text-[#00629b]">
              <UserPlus className="size-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-950">Add an account</h2>
              <p className="text-sm text-slate-500">
                Create login credentials and grant CMS access.
              </p>
            </div>
          </div>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Email</span>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={`${fieldClass} mt-1.5`}
                required
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Temporary password</span>
              <input
                type="password"
                autoComplete="new-password"
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={`${fieldClass} mt-1.5`}
                required
              />
              <span className="mt-1 block text-xs text-slate-500">
                At least 8 characters. Share it securely with the new user.
              </span>
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Access level</span>
              <select
                value={role}
                onChange={(event) => setRole(event.target.value as "admin" | "editor")}
                className={`${fieldClass} mt-1.5`}
              >
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            <button type="submit" disabled={create.isPending} className={primaryButtonClass}>
              <UserPlus className="size-4" />
              {create.isPending ? "Creating..." : "Create account"}
            </button>
          </form>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-950">Active CMS users</h2>
            <p className="mt-1 text-sm text-slate-500">
              Authorized accounts and their most recent sign-in.
            </p>
          </div>
          {admins.isLoading ? <LoadingSkeleton /> : null}
          {admins.isError ? (
            <ErrorState
              message={admins.error.message || "Unable to load admin accounts."}
              onRetry={() => admins.refetch()}
            />
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
                    <span
                      className={`grid size-10 place-items-center rounded-md ${admin.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
                    >
                      <ShieldCheck className="size-5" />
                    </span>
                    <div>
                      <p className="font-semibold text-slate-950">{admin.email}</p>
                      <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                        {admin.role} · {admin.active ? "Active access" : "Suspended"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {admin.last_sign_in_at
                          ? `Last sign-in ${new Date(admin.last_sign_in_at).toLocaleString()}`
                          : "Has not signed in yet"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(admin)}
                    className={secondaryButtonClass}
                  >
                    <Trash2 className="size-4" />
                    Remove access
                  </button>
                </article>
              ))}
            </div>
          ) : null}
        </section>
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Remove this CMS account?"
        description={`This deletes ${deleteTarget?.email ?? "the selected account"} from Supabase Auth and revokes CMS access.`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && remove.mutate(deleteTarget.id)}
      />
    </AdminLayout>
  );
}
