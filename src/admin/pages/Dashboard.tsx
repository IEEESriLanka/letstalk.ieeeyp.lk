import { useQuery } from "@tanstack/react-query";
import { Award, CalendarDays, GalleryHorizontalEnd, Inbox, UsersRound } from "lucide-react";
import { AdminLayout } from "@/admin/components/AdminLayout";
import {
  ErrorState,
  LoadingSkeleton,
  StatCard,
  StatusBadge,
} from "@/admin/components/AdminPrimitives";
import { getDashboardStats, getRecentActivity } from "@/admin/services/admin-data";

export function Dashboard() {
  const stats = useQuery({ queryKey: ["admin-dashboard-stats"], queryFn: getDashboardStats });
  const activity = useQuery({ queryKey: ["admin-recent-activity"], queryFn: getRecentActivity });

  return (
    <AdminLayout title="Dashboard" subtitle="Manage your IEEE LETs Talk website content.">
      {stats.isError ? (
        <ErrorState
          message="Unable to load dashboard statistics."
          onRetry={() => stats.refetch()}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <StatCard
            label="Total Events"
            value={stats.data?.totalEvents ?? "..."}
            icon={<CalendarDays className="size-5" />}
          />
          <StatCard
            label="Published Events"
            value={stats.data?.publishedEvents ?? "..."}
            icon={<CalendarDays className="size-5" />}
            tone="green"
          />
          <StatCard
            label="Gallery Images"
            value={stats.data?.galleryImages ?? "..."}
            icon={<GalleryHorizontalEnd className="size-5" />}
            tone="violet"
          />
          <StatCard
            label="Awards"
            value={stats.data?.awards ?? "..."}
            icon={<Award className="size-5" />}
            tone="orange"
          />
          <StatCard
            label="Active Partners"
            value={stats.data?.partners ?? "..."}
            icon={<UsersRound className="size-5" />}
          />
          <StatCard
            label="Unread Messages"
            value={stats.data?.unreadMessages ?? "..."}
            icon={<Inbox className="size-5" />}
            tone="slate"
          />
        </div>
      )}

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-slate-950">Recent Activity</h2>
          <p className="mt-1 text-sm text-slate-500">
            Latest events, gallery uploads, and contact messages.
          </p>
        </div>

        {activity.isLoading ? <LoadingSkeleton /> : null}
        {activity.isError ? (
          <ErrorState
            message="Unable to load recent activity."
            onRetry={() => activity.refetch()}
          />
        ) : null}
        {activity.data ? (
          <div className="grid gap-4 lg:grid-cols-3">
            <ActivityList
              title="Events"
              items={activity.data.events.map((item) => ({
                id: item.id,
                title: item.title,
                meta: new Date(item.created_at).toLocaleDateString(),
                status: <StatusBadge active={item.published} />,
              }))}
            />
            <ActivityList
              title="Gallery"
              items={activity.data.gallery.map((item) => ({
                id: item.id,
                title: item.title,
                meta: new Date(item.created_at).toLocaleDateString(),
                status: <StatusBadge active={item.published} />,
              }))}
            />
            <ActivityList
              title="Messages"
              items={activity.data.messages.map((item) => ({
                id: item.id,
                title: item.name,
                meta: item.topic,
                status: <StatusBadge active={!item.read} activeText="Unread" inactiveText="Read" />,
              }))}
            />
          </div>
        ) : null}
      </section>
    </AdminLayout>
  );
}

function ActivityList({
  title,
  items,
}: {
  title: string;
  items: Array<{ id: string; title: string; meta: string; status: JSX.Element }>;
}) {
  return (
    <div className="rounded-lg border border-slate-200">
      <h3 className="border-b border-slate-200 px-4 py-3 text-sm font-bold text-slate-950">
        {title}
      </h3>
      <div className="divide-y divide-slate-100">
        {items.length === 0 ? (
          <p className="px-4 py-5 text-sm text-slate-500">No recent items.</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex items-start justify-between gap-3 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                <p className="mt-1 text-xs text-slate-500">{item.meta}</p>
              </div>
              {item.status}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
