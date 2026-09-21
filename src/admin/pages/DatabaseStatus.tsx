import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Database, HardDrive, RefreshCw } from "lucide-react";
import { AdminLayout } from "@/admin/components/AdminLayout";
import {
  ErrorState,
  LoadingSkeleton,
  primaryButtonClass,
} from "@/admin/components/AdminPrimitives";
import { getDatabaseStatus, type DatabaseCheck } from "@/admin/services/admin-data";

export function DatabaseStatusPage() {
  const status = useQuery({ queryKey: ["database-status"], queryFn: getDatabaseStatus });
  const hasIssue =
    status.data &&
    (!status.data.env.urlConfigured ||
      !status.data.env.keyConfigured ||
      status.data.tables.some((item) => !item.ok) ||
      status.data.buckets.some((item) => !item.ok));

  return (
    <AdminLayout
      title="Database"
      subtitle="Check the Supabase tables and storage buckets used by the CMS."
    >
      <div className="space-y-5">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-md bg-[#00629b]/10 text-[#00629b]">
                <Database className="size-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-slate-950">Supabase Connection</h2>
                <p className="text-sm text-slate-500">
                  This page checks the real CMS base used by the website.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => status.refetch()}
              className={primaryButtonClass}
              disabled={status.isFetching}
            >
              <RefreshCw className="size-4" />
              {status.isFetching ? "Checking..." : "Check Again"}
            </button>
          </div>

          {status.isLoading ? <div className="mt-5"><LoadingSkeleton /></div> : null}
          {status.isError ? (
            <div className="mt-5">
              <ErrorState
                message="Unable to check Supabase."
                onRetry={() => status.refetch()}
              />
            </div>
          ) : null}

          {status.data ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <EnvBadge label="VITE_SUPABASE_URL" ok={status.data.env.urlConfigured} />
              <EnvBadge label="VITE_SUPABASE_PUBLISHABLE_KEY" ok={status.data.env.keyConfigured} />
            </div>
          ) : null}
        </section>

        {status.data ? (
          <>
            <StatusPanel
              title="Tables"
              icon={<Database className="size-5" />}
              items={status.data.tables}
            />
            <StatusPanel
              title="Storage Buckets"
              icon={<HardDrive className="size-5" />}
              items={status.data.buckets}
            />
            {hasIssue ? (
              <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 size-5 shrink-0" />
                  <div>
                    <p className="font-bold">Database setup is incomplete.</p>
                    <p className="mt-1 leading-relaxed">
                      Apply `supabase-schema.sql` and `supabase-seed.sql` to your Supabase
                      Postgres database, then refresh this page.
                    </p>
                  </div>
                </div>
              </section>
            ) : (
              <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-5 text-sm font-semibold text-emerald-800">
                Supabase tables and buckets are connected.
              </section>
            )}
          </>
        ) : null}
      </div>
    </AdminLayout>
  );
}

function EnvBadge({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <StatusIcon ok={ok} label={ok ? "Configured" : "Missing"} />
    </div>
  );
}

function StatusPanel({
  title,
  icon,
  items,
}: {
  title: string;
  icon: ReactNode;
  items: DatabaseCheck[];
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-md bg-slate-100 text-slate-700">
          {icon}
        </span>
        <h2 className="text-lg font-bold text-slate-950">{title}</h2>
      </div>
      <div className="divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200">
        {items.map((item) => (
          <article key={item.name} className="grid gap-2 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <p className="font-semibold text-slate-950">{item.name}</p>
              {item.issue ? <p className="mt-1 text-sm text-red-700">{item.issue}</p> : null}
            </div>
            <StatusIcon
              ok={item.ok}
              label={item.ok ? (item.rows === null || item.rows === undefined ? "OK" : `${item.rows} rows`) : "Issue"}
            />
          </article>
        ))}
      </div>
    </section>
  );
}

function StatusIcon({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${
        ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
      }`}
    >
      {ok ? <CheckCircle2 className="size-3.5" /> : <AlertTriangle className="size-3.5" />}
      {label}
    </span>
  );
}
