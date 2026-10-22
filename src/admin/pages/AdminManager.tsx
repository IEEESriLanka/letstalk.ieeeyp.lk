import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type FormEvent, useState } from "react";
import {
  Eye,
  EyeOff,
  Info,
  LockKeyhole,
  Mail,
  Pencil,
  Search,
  ShieldCheck,
  Trash2,
  UserPlus,
  UsersRound,
} from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "@/admin/components/AdminLayout";
import { EmptyState, ErrorState, LoadingSkeleton } from "@/admin/components/AdminPrimitives";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { isSuperAdmin } from "@/lib/super-admin";
import { adminSessionExpiredMessage, withAdminSession } from "@/lib/admin-session";
import {
  createAdminAccountSecurely,
  deleteAdminAccountSecurely,
  listAdminAccountsSecurely,
  updateAdminRoleSecurely,
} from "@/lib/admin-account-actions";

type MemberRole = "admin" | "editor";
type AdminAccount = {
  id: string;
  user_id: string;
  email: string;
  name: string;
  role: "super_admin" | MemberRole;
  last_sign_in_at: string | null;
  active: boolean;
};
const inputClass =
  "h-13 w-full rounded-2xl border border-[#cfdbee] bg-white px-4 text-sm text-[#0b1739] outline-none focus:border-[#0064ac] focus:ring-3 focus:ring-sky-100 disabled:opacity-60";
const buttonClass =
  "inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-[#0062aa] px-5 text-sm font-semibold text-white hover:bg-[#004e89] disabled:cursor-not-allowed disabled:opacity-50";
const roleNames = { super_admin: "Super Admin", admin: "Admin", editor: "Editor" };
const roleColors = {
  super_admin: "bg-indigo-800 text-white",
  admin: "bg-purple-100 text-purple-700",
  editor: "bg-sky-100 text-blue-700",
};
export function AdminManagerPage() {
  const { data: access } = useAuth();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<MemberRole>("editor");
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<AdminAccount | null>(null);
  const [editTarget, setEditTarget] = useState<AdminAccount | null>(null);
  const [editRole, setEditRole] = useState<MemberRole>("editor");
  const canManage = access?.ok === true && isSuperAdmin(access.admin.role, access.identity.email);
  const admins = useQuery({
    queryKey: ["admin-accounts", access?.ok ? access.admin.user_id : null],
    queryFn: async () =>
      withAdminSession(supabase.auth, (accessToken) =>
        listAdminAccountsSecurely({ data: { accessToken } }),
      ) as Promise<AdminAccount[]>,
    enabled: canManage,
    retry: false,
  });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin-accounts"] });
  const create = useMutation({
    mutationFn: async () =>
      withAdminSession(supabase.auth, (accessToken) =>
        createAdminAccountSecurely({ data: { accessToken, email, password, role } }),
      ),
    onSuccess: () => {
      toast.success("CMS account created.");
      setEmail("");
      setPassword("");
      setShowPassword(false);
      setRole("editor");
      void refresh();
    },
    onError: (error) => toast.error(error.message),
  });
  const remove = useMutation({
    mutationFn: async (id: string) =>
      withAdminSession(supabase.auth, (accessToken) =>
        deleteAdminAccountSecurely({ data: { accessToken, id } }),
      ),
    onSuccess: () => {
      toast.success("CMS account removed.");
      setDeleteTarget(null);
      void refresh();
    },
    onError: (error) => toast.error(error.message),
  });
  const update = useMutation({
    mutationFn: async (id: string) =>
      withAdminSession(supabase.auth, (accessToken) =>
        updateAdminRoleSecurely({ data: { accessToken, id, role: editRole } }),
      ),
    onSuccess: () => {
      toast.success("Account role updated.");
      setEditTarget(null);
      void refresh();
    },
    onError: (error) => toast.error(error.message),
  });
  if (!canManage)
    return (
      <AdminLayout title="Admin Manager" subtitle="CMS account access">
        <ErrorState message="Only the super admin can view and manage CMS accounts." />
        <a href="/admin/settings" className={`${buttonClass} mt-5`}>
          Change my password
        </a>
      </AdminLayout>
    );
  const members = (admins.data ?? []).filter((member) =>
    `${member.name} ${member.email} ${roleNames[member.role]}`
      .toLowerCase()
      .includes(search.trim().toLowerCase()),
  );
  const sortedMembers = [...members].sort(
    (a, b) => Number(b.role === "super_admin") - Number(a.role === "super_admin"),
  );
  function submit(event: FormEvent) {
    event.preventDefault();
    if (!create.isPending) create.mutate();
  }
  return (
    <AdminLayout
      title="Super Admin Manager"
      subtitle="Manage CMS accounts, roles, and access permissions."
      wide
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <p className="flex items-center gap-2 text-sm text-[#59719a]">
          <ShieldCheck className="size-4" />
          Your super-admin account is protected.
        </p>
        <label className="relative w-full sm:w-96">
          <span className="sr-only">Search users, email, or role</span>
          <Search className="absolute top-4 left-4 size-5 text-[#59719a]" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search users, email, or role..."
            className={`${inputClass} pl-12`}
            type="search"
          />
        </label>
      </div>
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(320px,0.72fr)_minmax(0,1.28fr)]">
        <section className="rounded-2xl border border-[#e1eaf6] bg-white p-6 shadow-sm sm:p-7">
          <div className="flex items-center gap-4">
            <span className="grid size-16 shrink-0 place-items-center rounded-full bg-[#edf6ff] text-[#0062aa]">
              <UserPlus className="size-8" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-[#0b1739]">Add a CMS member</h2>
              <p className="mt-1 text-sm text-[#59719a]">
                Create a new account and grant CMS access.
              </p>
            </div>
          </div>
          <form onSubmit={submit} className="mt-8 space-y-6">
            <label className="block text-sm font-semibold text-[#0b1739]">
              Email address
              <span className="relative mt-2 block">
                <Mail className="absolute top-4 left-4 size-5 text-[#59719a]" />
                <input
                  type="email"
                  autoComplete="off"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className={`${inputClass} pl-12`}
                  placeholder="user@example.com"
                  maxLength={254}
                  required
                  disabled={create.isPending}
                />
              </span>
            </label>
            <div>
              <label htmlFor="member-password" className="text-sm font-semibold text-[#0b1739]">
                Temporary password
              </label>
              <div className="relative mt-2">
                <LockKeyhole className="absolute top-4 left-4 size-5 text-[#59719a]" />
                <input
                  id="member-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={128}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className={`${inputClass} pr-12 pl-12`}
                  placeholder="Enter a temporary password"
                  required
                  disabled={create.isPending}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide temporary password" : "Show temporary password"}
                  aria-pressed={showPassword}
                  className="absolute top-0 right-0 grid size-13 place-items-center text-[#59719a]"
                >
                  {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
              <p className="mt-2 text-xs leading-5 text-[#59719a]">
                Minimum 8 characters. Share it securely with the new user.
              </p>
            </div>
            <label className="block text-sm font-semibold text-[#0b1739]">
              Access level / Role
              <select
                value={role}
                onChange={(event) => setRole(event.target.value as MemberRole)}
                className={`${inputClass} mt-2`}
                disabled={create.isPending}
              >
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            <div className="flex gap-3 rounded-2xl bg-[#edf6ff] p-4 text-sm leading-6 text-[#4e6e9d]">
              <Info className="mt-1 size-5 shrink-0 text-blue-500" />
              <p>
                Admins and editors can manage CMS content. Only the super admin can manage accounts.
              </p>
            </div>
            <button
              type="submit"
              disabled={create.isPending}
              className={`${buttonClass} w-full py-4`}
            >
              <UserPlus className="size-5" />
              {create.isPending ? "Creating account..." : "Create account"}
            </button>
          </form>
        </section>
        <section className="min-w-0 rounded-2xl border border-[#e1eaf6] bg-white p-6 shadow-sm sm:p-7">
          <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="grid size-16 shrink-0 place-items-center rounded-full bg-[#edf6ff] text-[#0062aa]">
                <UsersRound className="size-8" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-[#0b1739]">Active CMS members</h2>
                <p className="mt-1 text-sm text-[#59719a]">
                  Manage authorized accounts and permissions.
                </p>
              </div>
            </div>
            <div className="space-y-3 xl:ml-auto xl:text-right">
              {admins.data && (
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700">
                  <span className="size-2 rounded-full bg-emerald-600" />
                  {admins.data.filter((member) => member.active).length} active
                </span>
              )}
              <p className="flex items-center gap-2 text-xs text-[#59719a]">
                <ShieldCheck className="size-5 shrink-0" />
                Only the super admin can manage accounts.
              </p>
            </div>
          </div>
          {admins.isLoading && <LoadingSkeleton />}
          {admins.isError && (
            <div>
              <ErrorState message={admins.error.message} onRetry={() => void admins.refetch()} />
              {admins.error.message === adminSessionExpiredMessage && (
                <a href="/admin/login?redirect=%2Fadmin%2Fadmins" className={`${buttonClass} mt-3`}>
                  Sign in again
                </a>
              )}
            </div>
          )}
          {admins.isSuccess && sortedMembers.length === 0 && (
            <EmptyState
              title={search ? "No members match your search." : "No CMS members found."}
            />
          )}
          {sortedMembers.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[710px] text-left text-sm">
                <thead className="border-y border-[#e5edf8] bg-[#f4f7fb] text-[#0b1739]">
                  <tr>
                    {["#", "User", "Role", "Status", "Last sign-in", "Actions"].map((heading) => (
                      <th
                        key={heading}
                        scope="col"
                        className="px-2 py-5 font-semibold first:rounded-l-xl last:rounded-r-xl"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5edf8]">
                  {sortedMembers.map((member, index) => {
                    const locked = member.role === "super_admin";
                    const you = access.ok && member.user_id === access.admin.user_id;
                    return (
                      <tr key={member.id}>
                        <td className="px-2 py-6 text-[#59719a]">
                          {String(index + 1).padStart(2, "0")}
                        </td>
                        <td className="px-2 py-6">
                          <div className="flex items-center gap-3">
                            <span
                              className={`grid size-12 shrink-0 place-items-center rounded-full text-base font-semibold text-white ${locked ? "bg-[#0062aa]" : member.role === "admin" ? "bg-[#7863bc]" : "bg-[#0b9344]"}`}
                            >
                              {member.name.slice(0, 2).toUpperCase()}
                            </span>
                            <div>
                              <p className="font-semibold text-[#0b1739]">
                                {member.name}{" "}
                                {you && (
                                  <span className="ml-1 rounded-lg bg-sky-50 px-2 py-1 text-xs text-blue-600">
                                    You
                                  </span>
                                )}
                              </p>
                              <p
                                className="mt-1 max-w-56 truncate text-xs text-[#59719a]"
                                title={member.email}
                              >
                                {member.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-6">
                          <span
                            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-xs font-medium ${roleColors[member.role]}`}
                          >
                            {locked ? (
                              <ShieldCheck className="size-4" />
                            ) : member.role === "admin" ? (
                              <UsersRound className="size-4" />
                            ) : (
                              <Pencil className="size-4" />
                            )}
                            {roleNames[member.role]}
                          </span>
                        </td>
                        <td className="px-2 py-6">
                          <span
                            className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs ${member.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}
                          >
                            <span
                              className={`size-2 rounded-full ${member.active ? "bg-emerald-600" : "bg-slate-400"}`}
                            />
                            {member.active ? "Active" : "Suspended"}
                          </span>
                        </td>
                        <td className="px-2 py-6 text-xs leading-5 text-[#59719a]">
                          {member.last_sign_in_at
                            ? new Date(member.last_sign_in_at).toLocaleString("en-GB", {
                                timeZone: "Asia/Colombo",
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                              })
                            : "Never signed in"}
                        </td>
                        <td className="px-2 py-6">
                          {locked ? (
                            <span
                              title="The super-admin account is protected"
                              className="inline-grid size-10 place-items-center rounded-xl bg-slate-100 text-[#59719a]"
                            >
                              <LockKeyhole className="size-5" />
                              <span className="sr-only">Protected account</span>
                            </span>
                          ) : (
                            <div className="flex gap-2">
                              <button
                                type="button"
                                aria-label={`Edit role for ${member.email}`}
                                onClick={() => {
                                  setEditTarget(member);
                                  setEditRole(member.role as MemberRole);
                                }}
                                className="grid size-10 place-items-center rounded-xl bg-slate-100 text-[#0b1739] hover:bg-sky-100"
                              >
                                <Pencil className="size-4" />
                              </button>
                              <button
                                type="button"
                                aria-label={`Remove ${member.email}`}
                                onClick={() => setDeleteTarget(member)}
                                className="grid size-10 place-items-center rounded-xl bg-rose-100 text-rose-600 hover:bg-rose-200"
                              >
                                <Trash2 className="size-5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
      <Dialog
        open={Boolean(editTarget)}
        onOpenChange={(open) => {
          if (!open && !update.isPending) setEditTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit CMS role</DialogTitle>
            <DialogDescription>Change access for {editTarget?.email}.</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (editTarget && !update.isPending) update.mutate(editTarget.id);
            }}
            className="space-y-5"
          >
            <label className="block text-sm font-medium">
              Access level
              <select
                className={`${inputClass} mt-2`}
                value={editRole}
                onChange={(event) => setEditRole(event.target.value as MemberRole)}
                disabled={update.isPending}
              >
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
              </select>
            </label>
            <button className={buttonClass} disabled={update.isPending}>
              {update.isPending ? "Saving..." : "Save role"}
            </button>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open && !remove.isPending) setDeleteTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove this CMS account?</DialogTitle>
            <DialogDescription>
              This permanently deletes {deleteTarget?.email} and revokes their CMS access.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              disabled={remove.isPending}
              className="rounded-xl border px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={remove.isPending}
              onClick={() => deleteTarget && remove.mutate(deleteTarget.id)}
              className={`${buttonClass} bg-rose-600 hover:bg-rose-700`}
            >
              {remove.isPending ? "Removing..." : "Remove account"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
