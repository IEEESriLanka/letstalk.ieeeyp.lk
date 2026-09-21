import { createFileRoute } from "@tanstack/react-router";
import { ProtectedAdminRoute } from "@/admin/components/AdminLayout";
import { SettingsPage } from "@/admin/pages/ContentPages";

export const Route = createFileRoute("/admin/settings")({
  component: () => (
    <ProtectedAdminRoute>
      <SettingsPage />
    </ProtectedAdminRoute>
  ),
});
