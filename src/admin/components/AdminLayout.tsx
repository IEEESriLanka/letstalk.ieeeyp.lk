import { Link, Navigate, Outlet, useLocation } from "@tanstack/react-router";
import {
  Bell,
  CalendarDays,
  Database,
  GalleryHorizontalEnd,
  Home,
  Inbox,
  LogOut,
  Menu,
  PanelLeftClose,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Trophy,
  UsersRound,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Toaster, toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { signOutAdmin } from "@/lib/auth";

const navItems = [
  { label: "Dashboard", to: "/admin", icon: Home },
  { label: "Events", to: "/admin/events", icon: CalendarDays },
  { label: "Team", to: "/admin/team", icon: UsersRound },
  { label: "Programs", to: "/admin/programs", icon: Sparkles },
  { label: "Gallery", to: "/admin/gallery", icon: GalleryHorizontalEnd },
  { label: "Awards", to: "/admin/awards", icon: Trophy },
  { label: "Partners", to: "/admin/partners", icon: UsersRound },
  { label: "Messages", to: "/admin/messages", icon: Inbox },
  { label: "Admin Manager", to: "/admin/admins", icon: ShieldCheck },
  { label: "Database", to: "/admin/database", icon: Database },
] as const;

export function ProtectedAdminRoute({ children }: { children?: ReactNode }) {
  const location = useLocation();
  const { data: access, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f7fb] px-4">
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm font-semibold text-slate-700 shadow-sm">
          Checking administrator access...
        </div>
      </div>
    );
  }

  if (!access?.ok) {
    const redirect = `${location.pathname}${location.searchStr || ""}`;
    return <Navigate to="/admin/login" search={{ redirect }} replace />;
  }

  return <>{children ?? <Outlet />}</>;
}

export function AdminLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: access } = useAuth();

  async function logout() {
    try {
      await signOutAdmin();
      window.location.href = "/admin/login";
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to sign out.");
    }
  }

  return (
    <div className="min-h-screen bg-[#f4f6fa] text-slate-900">
      <Toaster richColors position="top-right" />
      <button
        type="button"
        className="fixed top-4 left-4 z-50 inline-flex size-10 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 shadow-sm lg:hidden"
        onClick={() => setMobileOpen(true)}
        aria-label="Open admin navigation"
      >
        <Menu className="size-5" />
      </button>

      <AdminSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} onLogout={logout} />

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="flex min-h-20 flex-col gap-4 px-5 py-4 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="pl-12 lg:pl-0">
              <p className="text-xs font-semibold tracking-[0.18em] text-[#00629b] uppercase">
                IEEE LETs Talk CMS
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">{title}</h1>
              {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
            </div>
            <div className="flex items-center gap-3">
              <label className="relative hidden min-w-72 md:block">
                <span className="sr-only">Search admin content</span>
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  className="h-10 w-full rounded-md border border-slate-200 bg-slate-50 pr-3 pl-9 text-sm outline-none transition focus:border-[#00629b] focus:bg-white focus:ring-2 focus:ring-[#00629b]/15"
                  placeholder="Search content"
                />
              </label>
              <button
                type="button"
                aria-label="Notifications"
                className="inline-flex size-10 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600"
              >
                <Bell className="size-4" />
              </button>
              <div className="hidden items-center gap-3 rounded-md border border-slate-200 bg-white px-3 py-2 sm:flex">
                <div className="flex size-8 items-center justify-center rounded-md bg-[#00629b] text-xs font-bold text-white">
                  AD
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900">Administrator</p>
                  <p className="text-xs text-slate-500">
                    {access?.ok ? access.admin.role : "admin"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl px-5 py-6 sm:px-8">{children}</main>
      </div>
    </div>
  );
}

function AdminSidebar({
  open,
  onClose,
  onLogout,
}: {
  open: boolean;
  onClose: () => void;
  onLogout: () => void;
}) {
  const location = useLocation();
  const sidebar = (
    <aside className="flex h-full w-72 flex-col border-r border-slate-800 bg-[#081625] text-white">
      <div className="flex h-20 items-center justify-between border-b border-white/10 px-5">
        <Link to="/admin" className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-md bg-[#00629b]">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <p className="text-sm font-bold tracking-tight">IEEE LETs Talk</p>
            <p className="text-xs font-semibold tracking-[0.18em] text-sky-200 uppercase">Admin</p>
          </div>
        </Link>
        <button type="button" className="lg:hidden" onClick={onClose} aria-label="Close navigation">
          <X className="size-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-5">
        {navItems.map((item) => {
          const active =
            item.to === "/admin"
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition ${
                active
                  ? "bg-white text-[#081625] shadow-sm"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        <Link
          to="/admin/settings"
          onClick={onClose}
          className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/10 hover:text-white"
        >
          <Settings className="size-4" />
          Settings
        </Link>
        <button
          type="button"
          onClick={onLogout}
          className="mt-1 flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-semibold text-slate-300 hover:bg-white/10 hover:text-white"
        >
          <LogOut className="size-4" />
          Logout
        </button>
        <div className="mt-4 rounded-md border border-white/10 bg-white/5 p-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-100">
            <PanelLeftClose className="size-4" />
            Production CMS
          </div>
          <p className="mt-2 text-xs leading-relaxed text-slate-400">
            Content changes are secured by Supabase Auth and RLS policies.
          </p>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      <div className="fixed inset-y-0 left-0 z-40 hidden lg:block">{sidebar}</div>
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/60"
            onClick={onClose}
            aria-label="Close navigation overlay"
          />
          <div className="relative h-full">{sidebar}</div>
        </div>
      ) : null}
    </>
  );
}
