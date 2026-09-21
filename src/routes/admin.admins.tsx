import { createFileRoute } from "@tanstack/react-router";
import { ProtectedAdminRoute } from "@/admin/components/AdminLayout";
import { AdminManagerPage } from "@/admin/pages/AdminManager";

export const Route = createFileRoute("/admin/admins")({
  component: () => (
    <ProtectedAdminRoute>
      <AdminManagerPage />
    </ProtectedAdminRoute>
  ),
});
