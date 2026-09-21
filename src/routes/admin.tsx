import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { ProtectedAdminRoute } from "@/admin/components/AdminLayout";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Dashboard | IEEE LETs Talk CMS" },
      { name: "description", content: "IEEE LETs Talk content management dashboard." },
    ],
  }),
  component: AdminRouteLayout,
});

function AdminRouteLayout() {
  const location = useLocation();
  if (location.pathname === "/admin/login") return <Outlet />;
  return (
    <ProtectedAdminRoute>
      <Outlet />
    </ProtectedAdminRoute>
  );
}
